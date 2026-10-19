import mongoose from "mongoose";

import { Product } from "./product.model.js";
import type {
    CreateProductInput,
    UpdateProductInput,
} from "./product.validation.js";
import { AppError } from "../../utils/app-error.js";

interface ProductActor {
    userId: string;
    workspaceId: string;
}

function handleDuplicateSku(error: unknown): never {
    if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === 11000
    ) {
        throw new AppError(
            409,
            "A product with this SKU already exists in your workspace",
        );
    }

    throw error;
}

export async function createProduct(
    actor: ProductActor,
    input: CreateProductInput,
) {
    try {
        const product = await Product.create({
            name: input.name,
            sku: input.sku,
            description: input.description ?? "",
            costPrice: input.costPrice,
            sellingPrice: input.sellingPrice,
            stockQuantity: input.stockQuantity ?? 0,
            lowStockThreshold: input.lowStockThreshold ?? 5,
            category: input.category ? new mongoose.Types.ObjectId(input.category) : null,
            supplier: input.supplier ? new mongoose.Types.ObjectId(input.supplier) : null,
            leadTimeDays: input.leadTimeDays ?? 0,
            safetyStock: input.safetyStock ?? 0,
            isArchived: false,
            workspace: new mongoose.Types.ObjectId(actor.workspaceId),
            createdBy: new mongoose.Types.ObjectId(actor.userId),
        });

        return { product };
    } catch (error) {
        handleDuplicateSku(error);
    }
}

export async function listProducts(actor: ProductActor) {
    const products = await Product.find({
        workspace: actor.workspaceId,
        isArchived: { $ne: true },
    })
        .populate("category", "name")
        .populate("supplier", "name contactPerson phone")
        .sort({ createdAt: -1 });

    return {
        products,
        total: products.length,
    };
}

export async function getProductById(
    actor: ProductActor,
    productId: string,
) {
    const product = await Product.findOne({
        _id: productId,
        workspace: actor.workspaceId,
    })
        .populate("category", "name")
        .populate("supplier", "name contactPerson phone");

    if (!product) {
        throw new AppError(404, "Product not found");
    }

    return { product };
}

export async function updateProduct(
    actor: ProductActor,
    productId: string,
    input: UpdateProductInput,
) {
    try {
        const product = await Product.findOneAndUpdate(
            {
                _id: productId,
                workspace: actor.workspaceId,
            },
            { $set: input },
            {
                new: true,
                runValidators: true,
            },
        )
            .populate("category", "name")
            .populate("supplier", "name contactPerson phone");

        if (!product) {
            throw new AppError(404, "Product not found");
        }

        return { product };
    } catch (error) {
        handleDuplicateSku(error);
    }
}

export async function deleteProduct(
    actor: ProductActor,
    productId: string,
) {
    const product = await Product.findOneAndUpdate(
        {
            _id: productId,
            workspace: actor.workspaceId,
        },
        { $set: { isArchived: true } },
        { new: true },
    );

    if (!product) {
        throw new AppError(404, "Product not found");
    }

    return { deleted: true, productId: product.id };
}

export async function getLowStockProducts(workspaceId: string) {
    if (!workspaceId) {
        throw new AppError(401, "Workspace context is required");
    }

    const products = await Product.find({
        workspace: workspaceId,
        $expr: {
            $lte: ["$stockQuantity", "$lowStockThreshold"],
        },
    }).sort({
        stockQuantity: 1,
        name: 1,
    });

    return {
        products,
        total: products.length,
    };
}