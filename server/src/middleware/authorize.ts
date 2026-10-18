import type { RequestHandler } from "express";

import { AppError } from "../utils/app-error.js";
import { UserRole } from "../modules/users/user.model.js";

export function authorize(...allowedRoles: UserRole[]): RequestHandler {
    return (req, _res, next) => {
        if (!req.auth) {
            next(new AppError(401, "Authentication is required"));
            return;
        }

        if (!allowedRoles.includes(req.auth.role)) {
            next(new AppError(403, "You do not have permission"));
            return;
        }

        next();
    };
}