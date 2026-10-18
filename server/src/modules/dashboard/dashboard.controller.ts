import type { RequestHandler } from "express";

import { getDashboardSummary } from "./dashboard.service.js";
import { AppError } from "../../utils/app-error.js";

export const dashboardSummaryController: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        if (!req.auth) {
            throw new AppError(401, "Authentication is required");
        }

        const result = await getDashboardSummary(
            req.auth.workspaceId,
        );

        res.status(200).json({
            success: true,
            message: "Dashboard summary retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};