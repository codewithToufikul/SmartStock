import type { RequestHandler } from "express";
import { z } from "zod";
import { AppError } from "../../utils/app-error.js";
import { getProductDemandForecast } from "./sale-forecast.service.js";

const forecastQuerySchema = z
    .object({
        days: z.coerce.number().int().min(7).max(90).default(30),
    })
    .strict();

export const productDemandForecastController: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        if (!req.auth) {
            throw new AppError(401, "Authentication is required");
        }

        const { days } = forecastQuerySchema.parse(req.query);

        const result = await getProductDemandForecast(
            req.auth.workspaceId,
            days,
        );

        res.status(200).json({
            success: true,
            message: "Product demand forecast retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};