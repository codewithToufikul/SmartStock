import type { RequestHandler } from "express";

import { AppError } from "../../utils/app-error.js";
import {
    createStockMovement,
    getStockMovementHistory,
} from "./stock-movement.service.js";
import { movementHistoryParamsSchema } from "./stock-movement.validation.js";

function getActor(req: Parameters<RequestHandler>[0]) {
    if (!req.auth) {
        throw new AppError(401, "Authentication is required");
    }

    return {
        userId: req.auth.userId,
        workspaceId: req.auth.workspaceId,
    };
}

export const createStockMovementController: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const result = await createStockMovement(getActor(req), req.body);

        res.status(201).json({
            success: true,
            message: "Stock movement recorded successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const stockMovementHistoryController: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const params = movementHistoryParamsSchema.safeParse(req.params);

        if (!params.success) {
            throw new AppError(400, "Invalid product ID");
        }

        const result = await getStockMovementHistory(
            getActor(req),
            params.data.productId,
        );

        res.status(200).json({
            success: true,
            message: "Stock movement history retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};