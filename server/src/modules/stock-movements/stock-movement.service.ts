import mongoose from "mongoose";

import { Product } from "../products/product.model.js";
import { StockMovement, StockMovementType } from "./stock-movement.model.js";
import type { CreateStockMovementInput } from "./stock-movement.validation.js";
import { AppError } from "../../utils/app-error.js";

interface MovementActor {
    userId: string;
    workspaceId: string;
}

export async function createStockMovement(
    actor: MovementActor,
    input: CreateStockMovementInput,
) {
    const session = await mongoose.startSession();

    try {
        let result: {
            movementId: string;
            productId: string;
            type: StockMovementType;
            previousQuantity: number;
            newQuantity: number;
            quantity: number;
        } | undefined;

        await session.withTransaction(async () => {
            const product = await Product.findOne({
                _id: input.productId,
                workspace: actor.workspaceId,
            }).session(session);

            if (!product) {
                throw new AppError(404, "Product not found");
            }

            const previousQuantity = product.stockQuantity;
            let newQuantity: number;

            if (input.type === "IN") {
                newQuantity = previousQuantity + input.quantity;
            } else if (input.type === "OUT") {
                if (previousQuantity < input.quantity) {
                    throw new AppError(409, "Insufficient stock");
                }

                newQuantity = previousQuantity - input.quantity;
            } else {
                newQuantity = input.newQuantity;
            }

            const quantity =
                input.type === "ADJUSTMENT"
                    ? Math.abs(newQuantity - previousQuantity)
                    : input.quantity;

            if (quantity === 0) {
                throw new AppError(400, "Stock quantity has not changed");
            }

            // Compare-and-set: stale quantity দিয়ে update ঠেকায়।
            const updatedProduct = await Product.findOneAndUpdate(
                {
                    _id: product._id,
                    workspace: actor.workspaceId,
                    stockQuantity: previousQuantity,
                },
                { $set: { stockQuantity: newQuantity } },
                {
                    new: true,
                    runValidators: true,
                    session,
                },
            );

            if (!updatedProduct) {
                throw new AppError(
                    409,
                    "Stock changed concurrently. Please retry",
                );
            }

            const [movement] = await StockMovement.create(
                [
                    {
                        product: product._id,
                        workspace: actor.workspaceId,
                        performedBy: actor.userId,
                        type: input.type,
                        quantity,
                        previousQuantity,
                        newQuantity,
                        reason: input.reason,
                    },
                ],
                { session },
            );

            if (!movement) {
                throw new AppError(500, "Unable to create stock movement");
            }

            result = {
                movementId: movement.id,
                productId: product.id,
                type: input.type,
                previousQuantity,
                newQuantity,
                quantity,
            };
        });

        if (!result) {
            throw new AppError(500, "Unable to create stock movement");
        }

        return { movement: result };
    } finally {
        await session.endSession();
    }
}

export async function getStockMovementHistory(
    actor: MovementActor,
    productId: string,
) {
    const product = await Product.findOne({
        _id: productId,
        workspace: actor.workspaceId,
    }).select("_id");

    if (!product) {
        throw new AppError(404, "Product not found");
    }

    const movements = await StockMovement.find({
        product: product._id,
        workspace: actor.workspaceId,
    })
        .sort({ createdAt: -1 })
        .limit(100)
        .populate("performedBy", "name email");

    return {
        movements,
        total: movements.length,
    };
}