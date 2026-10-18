import type { RequestHandler } from "express";
import { getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser } from "./auth.service.js";
import { AppError } from "../../utils/app-error.js";

export const registerController: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const result = await registerUser(req.body);
        res.status(201).json({
            success: true,
            message: "Account registered successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const loginController: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const result = await loginUser(req.body);
        res.status(200).json({
            success: true,
            message: "Login successful",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const refreshController: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const { refreshToken } = req.body;

        if (typeof refreshToken !== "string" || !refreshToken.trim()) {
            throw new AppError(400, "Refresh token is required");
        }

        const result = await refreshAccessToken(refreshToken);

        res.status(200).json({
            success: true,
            message: "Token refreshed successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const getMeController: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        if (!req.auth) {
            throw new Error("Authenticated user is missing");
        }

        const result = await getCurrentUser(req.auth.userId);

        res.status(200).json({
            success: true,
            message: "User profile retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const logoutController: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const refreshToken = req.body?.refreshToken;

        if (
            typeof refreshToken !== "string" ||
            !refreshToken.trim()
        ) {
            throw new AppError(400, "Refresh token is required");
        }

        await logoutUser(refreshToken);

        res.status(200).json({
            success: true,
            message: "Logout successful",
        });
    } catch (error) {
        next(error);
    }
};