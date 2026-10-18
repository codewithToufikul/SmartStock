import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import mongoose from "mongoose";

import { env } from "../../config/env.js";
import { AppError } from "../../utils/app-error.js";
import { User, UserRole } from "../users/user.model.js";
import { Workspace } from "../workspaces/workspace.model.js";
import type {
    RegisterUserInput,
    LoginUserInput,
} from "../users/user.validation.js";
import { createHash, randomBytes } from "node:crypto";
import { RefreshToken } from "./refresh-token.model.js";

function createAccessToken(user: {
    id: string;
    workspaceId: string;
    role: UserRole;
}): string {
    return jwt.sign(
        {
            workspaceId: user.workspaceId,
            role: user.role,
        },
        env.JWT_SECRET,
        {
            subject: user.id,
            expiresIn: env.JWT_ACCESS_EXPIRES_IN as NonNullable<SignOptions["expiresIn"]>,
        },
    );
}

function createRefreshToken(): string {
    return randomBytes(48).toString("base64url");
}

function hashRefreshToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
}

function getRefreshTokenExpiry(): Date {
    const expiresAt = new Date();

    expiresAt.setTime(
        expiresAt.getTime() + 7 * 24 * 60 * 60 * 1000,
    );

    return expiresAt;
}

async function issueRefreshToken(userId: mongoose.Types.ObjectId) {
    const refreshToken = createRefreshToken();

    await RefreshToken.create({
        user: userId,
        tokenHash: hashRefreshToken(refreshToken),
        expiresAt: getRefreshTokenExpiry(),
        revokedAt: null,
    });

    return refreshToken;
}

function publicUser(user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    workspace: mongoose.Types.ObjectId;
}) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        workspaceId: user.workspace.toString(),
    };
}

export async function registerUser(input: RegisterUserInput) {
    const email = input.email.toLocaleLowerCase();
    const existingUser = await User.exists({ email });

    if (existingUser) {
        throw new AppError(409, "An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    const userId = new mongoose.Types.ObjectId();

    const workspaceId = new mongoose.Types.ObjectId();
    const session = await mongoose.startSession();

    try {
        await session.withTransaction(async () => {
            await Workspace.create(
                [{
                    _id: workspaceId,
                    name: `${input.name.trim()}'s Workspace`,
                    owner: userId,
                }],
                { session },
            );

            await User.create(
                [{
                    _id: userId,
                    name: input.name.trim(),
                    email,
                    passwordHash,
                    role: UserRole.OWNER,
                    workspace: workspaceId,
                    isActive: true,
                }],
                { session },
            );
        });
    } catch (error: unknown) {
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === 11000
        ) {
            throw new AppError(409, "An account with this email already exists");
        }

        throw error;
    } finally {
        await session.endSession();
    }

    const user = await User.findById(userId);

    if (!user) {
        throw new AppError(500, "Unable to retrieve the registered account");
    }

    const token = createAccessToken({
        id: user.id,
        workspaceId: user.workspace.toString(),
        role: user.role,
    });
    const refreshToken = await issueRefreshToken(user._id);
    return {
        user: publicUser(user),
        accessToken: token,
        refreshToken,
        tokenType: "Bearer",
        expiresIn: 3600,
    };
}

export async function loginUser(input: LoginUserInput) {
    const email = input.email.toLowerCase();

    const user = await User.findOne({ email }).select("+passwordHash");

    if (!user) {
        throw new AppError(401, "Invalid email or password");
    }

    if (!user.isActive) {
        throw new AppError(403, "This account is inactive");
    }

    const passwordMatches = await bcrypt.compare(
        input.password,
        user.passwordHash,
    );

    if (!passwordMatches) {
        throw new AppError(401, "Invalid email or password");
    }

    const token = createAccessToken({
        id: user.id,
        workspaceId: user.workspace.toString(),
        role: user.role,
    });
    const refreshToken = await issueRefreshToken(user._id);
    return {
        user: publicUser(user),
        accessToken: token,
        refreshToken,
        tokenType: "Bearer",
        expiresIn: 3600,
    };
}

export async function refreshAccessToken(rawToken: string) {
    const tokenHash = hashRefreshToken(rawToken);

    const storedToken = await RefreshToken.findOne({
        tokenHash,
        revokedAt: null,
        expiresAt: { $gt: new Date() },
    }).select("+tokenHash");

    if (!storedToken) {
        throw new AppError(401, "   Invalid or expired refresh token");
    }

    const user = await User.findById(storedToken.user);

    if (!user || !user.isActive) {
        throw new AppError(401, "Invalid refresh token");
    }

    storedToken.revokedAt = new Date();
    await storedToken.save();

    const accessToken = createAccessToken({
        id: user.id,
        workspaceId: user.workspace.toString(),
        role: user.role,
    });

    const refreshToken = await issueRefreshToken(user._id);

    return {
        accessToken,
        refreshToken,
        tokenType: "Bearer",
        expiresIn: 900,
    };
}

export async function getCurrentUser(userId: string) {
    const user = await User.findById(userId);

    if (!user) {
        throw new AppError(401, "User account no longer exists");
    }

    if (!user.isActive) {
        throw new AppError(403, "This account is inactive");
    }

    return {
        user: publicUser(user),
    };
}

export async function logoutUser(rawToken: string) {
    const tokenHash = hashRefreshToken(rawToken);

    const result = await RefreshToken.updateOne(
        {
            tokenHash,
            revokedAt: null,
        },
        {
            $set: {
                revokedAt: new Date(),
            },
        },
    );

    if (result.matchedCount === 0) {
        throw new AppError(401, "Invalid refresh token");
    }

    return { loggedOut: true };
}