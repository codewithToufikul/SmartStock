import mongoose from "mongoose";
import { Category } from "./category.model.js";
import { Product } from "../products/product.model.js";
import type { CreateCategoryInput, UpdateCategoryInput } from "./category.validation.js";
import { AppError } from "../../utils/app-error.js";

interface Actor {
    userId: string;
    workspaceId: string;
}

export async function createCategory(actor: Actor, input: CreateCategoryInput) {
    try {
        const category = await Category.create({
            name: input.name,
            description: input.description ?? "",
            workspace: new mongoose.Types.ObjectId(actor.workspaceId),
            isArchived: false,
        });

        return { category };
    } catch (error: unknown) {
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === 11000
        ) {
            throw new AppError(409, "A category with this name already exists in your workspace");
        }
        throw error;
    }
}

export async function listCategories(actor: Actor, includeArchived = false) {
    const filter: Record<string, unknown> = {
        workspace: new mongoose.Types.ObjectId(actor.workspaceId),
    };

    if (!includeArchived) {
        filter.isArchived = false;
    }

    const categories = await Category.find(filter).sort({ name: 1 });

    return {
        categories,
        total: categories.length,
    };
}

export async function getCategoryById(actor: Actor, categoryId: string) {
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        throw new AppError(400, "Invalid category ID");
    }

    const category = await Category.findOne({
        _id: categoryId,
        workspace: actor.workspaceId,
    });

    if (!category) {
        throw new AppError(404, "Category not found");
    }

    return { category };
}

export async function updateCategory(
    actor: Actor,
    categoryId: string,
    input: UpdateCategoryInput,
) {
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        throw new AppError(400, "Invalid category ID");
    }

    try {
        const category = await Category.findOneAndUpdate(
            {
                _id: categoryId,
                workspace: actor.workspaceId,
            },
            { $set: input },
            { new: true, runValidators: true },
        );

        if (!category) {
            throw new AppError(404, "Category not found");
        }

        return { category };
    } catch (error: unknown) {
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === 11000
        ) {
            throw new AppError(409, "A category with this name already exists in your workspace");
        }
        throw error;
    }
}

export async function archiveCategory(actor: Actor, categoryId: string) {
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        throw new AppError(400, "Invalid category ID");
    }

    // Check if an active product depends on this category (FR-04 requirement)
    const productUsingCategory = await Product.findOne({
        workspace: actor.workspaceId,
        category: categoryId,
        isArchived: { $ne: true },
    }).select("_id name");

    if (productUsingCategory) {
        throw new AppError(
            409,
            `Cannot archive category because product "${productUsingCategory.name}" is using it. Please reassign the product first.`,
        );
    }

    const category = await Category.findOneAndUpdate(
        {
            _id: categoryId,
            workspace: actor.workspaceId,
        },
        { $set: { isArchived: true } },
        { new: true },
    );

    if (!category) {
        throw new AppError(404, "Category not found");
    }

    return { category, message: "Category archived successfully" };
}
