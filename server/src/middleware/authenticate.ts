import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";
import { UserRole } from "../modules/users/user.model.js";

export interface AuthenticatedUser {
    userId: string;
    workspaceId: string;
    role: UserRole;
}

declare global {
    namespace Express {
        interface Request {
            auth?: AuthenticatedUser;
        }
    }
}

export const authenticate: RequestHandler = (req, _res, next) => {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
        next(new AppError(401, "Authentication token is required"));
        return;
    }

    const token = authorization.slice("Bearer ".length).trim();

    if (!token) {
        next(new AppError(401, "Authentication token is required"));
        return;
    }

    try {
        const payload = jwt.verify(token, env.JWT_SECRET);

        if (
            typeof payload === "string" ||
            !payload.sub ||
            typeof payload.workspaceId !== "string" ||
            !Object.values(UserRole).includes(payload.role as UserRole)
        ) {
            next(new AppError(401, "Invalid authentication token"));
            return;
        }

        req.auth = {
            userId: payload.sub,
            workspaceId: payload.workspaceId,
            role: payload.role as UserRole,
        };

        next();
    } catch {
        next(new AppError(401, "Invalid or expired authentication token"));
    }
};