import type { RequestHandler } from "express";
import {
    archiveCategory,
    createCategory,
    getCategoryById,
    listCategories,
    updateCategory,
} from "./category.service.js";
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

export const createCategoryController: RequestHandler = async (req, res, next) => {
    try {
        const result = await createCategory(getActor(req), req.body);
        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const listCategoriesController: RequestHandler = async (req, res, next) => {
    try {
        const includeArchived = req.query.includeArchived === "true";
        const result = await listCategories(getActor(req), includeArchived);
        res.status(200).json({
            success: true,
            message: "Categories retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const getCategoryController: RequestHandler = async (req, res, next) => {
    try {
        const categoryId = req.params.id as string;
        const result = await getCategoryById(getActor(req), categoryId);
        res.status(200).json({
            success: true,
            message: "Category retrieved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const updateCategoryController: RequestHandler = async (req, res, next) => {
    try {
        const categoryId = req.params.id as string;
        const result = await updateCategory(getActor(req), categoryId, req.body);
        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const archiveCategoryController: RequestHandler = async (req, res, next) => {
    try {
        const categoryId = req.params.id as string;
        const result = await archiveCategory(getActor(req), categoryId);
        res.status(200).json({
            success: true,
            message: result.message,
            data: { category: result.category },
        });
    } catch (error) {
        next(error);
    }
};
