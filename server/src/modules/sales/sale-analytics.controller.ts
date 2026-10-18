import type { RequestHandler } from "express";
import { AppError } from "../../utils/app-error.js";
import { getDailySalesAnalytics, getSalesSummary } from "./sale-analytics.service.js";
import z from "zod";

export const salesSummaryController: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        if (!req.auth) {
            throw new AppError(401, "Authentication is required");
        }

        const result = await getSalesSummary(req.auth.workspaceId);

        res.status(200).json({
            success: true,
            message: "Sales summary retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const dailySalesAnalyticsController: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        if (!req.auth) {
            throw new AppError(401, "Authentication is required");
        }

        const querySchema = z.object({
            days: z.coerce.number().int().min(1).max(90).default(7),
        }).strict();

        const { days } = querySchema.parse(req.query);

        const result = await getDailySalesAnalytics(
            req.auth.workspaceId,
            days,
        );

        res.status(200).json({
            success: true,
            message: "Daily sales analytics retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};