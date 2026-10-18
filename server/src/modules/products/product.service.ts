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
            ...input,
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
    }).sort({ createdAt: -1 });

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
    });

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
        );

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
    const product = await Product.findOneAndDelete({
        _id: productId,
        workspace: actor.workspaceId,
    });

    if (!product) {
        throw new AppError(404, "Product not found");
    }

    return { deleted: true, productId: product.id };
}