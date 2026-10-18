import type { RequestHandler } from "express";

import {
    createProduct,
    deleteProduct,
    getLowStockProducts,
    getProductById,
    listProducts,
    updateProduct,
} from "./product.service.js";

import { productIdSchema } from "./product.validation.js";
import { AppError } from "../../utils/app-error.js";

function getActor(req: Parameters<RequestHandler>[0]) {
    if (!req.auth) {
        throw new AppError(401, "Authentication is required");
    }

    return {
        userId: req.auth.userId,
        workspaceId: req.auth.workspaceId,
    };
}

function getProductId(req: Parameters<RequestHandler>[0]) {
    const result = productIdSchema.safeParse(req.params);

    if (!result.success) {
        throw new AppError(400, "Invalid product ID");
    }

    return result.data.productId;
}

export const createProductController: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const result = await createProduct(getActor(req), req.body);

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const listProductsController: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const result = await listProducts(getActor(req));

        res.status(200).json({
            success: true,
            message: "Products retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const getProductController: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const result = await getProductById(
            getActor(req),
            getProductId(req),
        );

        res.status(200).json({
            success: true,
            message: "Product retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const updateProductController: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const result = await updateProduct(
            getActor(req),
            getProductId(req),
            req.body,
        );

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteProductController: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        const result = await deleteProduct(
            getActor(req),
            getProductId(req),
        );

        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const getLowStockProductsController: RequestHandler = async (
    req,
    res,
    next,
) => {
    try {
        if (!req.auth) {
            throw new AppError(401, "Authentication is required");
        }

        const result = await getLowStockProducts(
            req.auth.workspaceId,
        );

        res.status(200).json({
            success: true,
            message: "Low-stock products retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};