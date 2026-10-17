import type {
    ErrorRequestHandler,
    RequestHandler,
} from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/app-error.js";
import { env } from "../config/env.js";

export const notFoundHandler: RequestHandler = (
    _req,
    res,
) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found",
    });
};

export const errorHandler: ErrorRequestHandler = (
    error,
    _req,
    res,
    _next,
) => {
    if (error instanceof ZodError) {
        res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            })),
        });
        return;
    }

    if (error instanceof AppError) {
        res.status(error.statusCode).json({
            success: false,
            message: error.message,
        });
        return;
    }

    console.error("Unhandled application error:", error);

    res.status(500).json({
        success: false,
        message:
            env.NODE_ENV === "production"
                ? "Internal server error"
                : error instanceof Error
                    ? error.message
                    : "Unknown error",
    });
};