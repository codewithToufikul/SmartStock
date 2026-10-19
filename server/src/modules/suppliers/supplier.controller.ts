import type { RequestHandler } from "express";
import {
    archiveSupplier,
    createSupplier,
    getSupplierById,
    listSuppliers,
    updateSupplier,
} from "./supplier.service.js";
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

export const createSupplierController: RequestHandler = async (req, res, next) => {
    try {
        const result = await createSupplier(getActor(req), req.body);
        res.status(201).json({
            success: true,
            message: "Supplier created successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const listSuppliersController: RequestHandler = async (req, res, next) => {
    try {
        const search = typeof req.query.search === "string" ? req.query.search : undefined;
        const includeArchived = req.query.includeArchived === "true";
        const result = await listSuppliers(getActor(req), search, includeArchived);
        res.status(200).json({
            success: true,
            message: "Suppliers retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const getSupplierController: RequestHandler = async (req, res, next) => {
    try {
        const supplierId = req.params.id as string;
        const result = await getSupplierById(getActor(req), supplierId);
        res.status(200).json({
            success: true,
            message: "Supplier retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const updateSupplierController: RequestHandler = async (req, res, next) => {
    try {
        const supplierId = req.params.id as string;
        const result = await updateSupplier(getActor(req), supplierId, req.body);
        res.status(200).json({
            success: true,
            message: "Supplier updated successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const archiveSupplierController: RequestHandler = async (req, res, next) => {
    try {
        const supplierId = req.params.id as string;
        const result = await archiveSupplier(getActor(req), supplierId);
        res.status(200).json({
            success: true,
            message: result.message,
            data: { supplier: result.supplier },
        });
    } catch (error) {
        next(error);
    }
};
