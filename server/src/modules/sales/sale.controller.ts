import type { RequestHandler } from "express";

import { createSale, cancelSale } from "./sale.service.js";
import { Sale } from "./sale.model.js";
import { AppError } from "../../utils/app-error.js";
import { listSalesQuerySchema } from "./sale.validation.js";

export const createSaleController: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        if (!req.auth) {
            throw new AppError(401, "Authentication is required");
        }

        const result = await createSale(
            req.body,
            req.auth.userId,
            req.auth.workspaceId,
        );

        res.status(201).json({
            success: true,
            message: "Sale created successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const listSalesController: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        if (!req.auth) {
            throw new AppError(401, "Authentication is required");
        }

        const query = listSalesQuerySchema.parse(req.query);
        const skip = (query.page - 1) * query.limit;

        const filter = {
            workspace: req.auth.workspaceId,
        };

        const [sales, total] = await Promise.all([
            Sale.find(filter)
                .populate("soldBy", "name email")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(query.limit)
                .lean(),
            Sale.countDocuments(filter),
        ]);

        res.status(200).json({
            success: true,
            message: "Sales retrieved successfully",
            data: {
                sales,
                pagination: {
                    page: query.page,
                    limit: query.limit,
                    total,
                    totalPages: Math.ceil(total / query.limit),
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getSaleByIdController: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        if (!req.auth) {
            throw new AppError(401, "Authentication is required");
        }

        const sale = await Sale.findOne({
            _id: req.params.saleId,
            workspace: req.auth.workspaceId,
        })
            .populate("soldBy", "name email")
            .lean();

        if (!sale) {
            throw new AppError(404, "Sale not found");
        }

        res.status(200).json({
            success: true,
            message: "Sale retrieved successfully",
            data: { sale },
        });
    } catch (error) {
        next(error);
    }
};

export const cancelSaleController: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        if (!req.auth) {
            throw new AppError(401, "Authentication is required");
        }

        const saleId = req.params.saleId;
        if (!saleId || typeof saleId !== "string") {
            throw new AppError(400, "Valid sale ID is required");
        }

        const reason = req.body?.reason || "Customer return / Sale cancelled";
        const result = await cancelSale(
            req.auth.workspaceId,
            req.auth.userId,
            saleId,
            reason,
        );

        res.status(200).json({
            success: true,
            message: "Sale cancelled and stock reversed successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};