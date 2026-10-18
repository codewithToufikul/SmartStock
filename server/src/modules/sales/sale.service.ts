import mongoose from "mongoose";

import { Product } from "../products/product.model.js";
import { Sale } from "./sale.model.js";
import { StockMovement } from "../stock-movements/stock-movement.model.js";
import { AppError } from "../../utils/app-error.js";
import type { CreateSaleInput } from "./sale.validation.js";

export async function createSale(
    input: CreateSaleInput,
    userId: string,
    workspaceId: string,
) {
    const session = await mongoose.startSession();

    let createdSale: unknown;

    try {
        await session.withTransaction(async () => {
            const saleItems = [];
            let subtotal = 0;

            for (const item of input.items) {
                const product = await Product.findOne({
                    _id: item.productId,
                    workspace: workspaceId,
                }).session(session);

                if (!product) {
                    throw new AppError(
                        404,
                        `Product not found: ${item.productId}`,
                    );
                }

                if (product.stockQuantity < item.quantity) {
                    throw new AppError(
                        409,
                        `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}`,
                    );
                }

                const previousQuantity = product.stockQuantity;
                const newQuantity = previousQuantity - item.quantity;

                // Atomic conditional update: stock must still be sufficient.
                const updatedProduct = await Product.findOneAndUpdate(
                    {
                        _id: product._id,
                        workspace: workspaceId,
                        stockQuantity: { $gte: item.quantity },
                    },
                    {
                        $inc: { stockQuantity: -item.quantity },
                    },
                    {
                        new: true,
                        session,
                        runValidators: true,
                    },
                );

                if (!updatedProduct) {
                    throw new AppError(
                        409,
                        `Stock changed during sale for ${product.name}. Please retry.`,
                    );
                }

                const unitPrice = product.sellingPrice;
                const unitCost = product.costPrice;
                const lineTotal = Number(
                    (unitPrice * item.quantity).toFixed(2),
                );

                subtotal = Number((subtotal + lineTotal).toFixed(2));

                saleItems.push({
                    product: product._id,
                    name: product.name,
                    sku: product.sku,
                    quantity: item.quantity,
                    unitPrice,
                    unitCost,
                    lineTotal,
                });

                await StockMovement.create(
                    [
                        {
                            product: product._id,
                            workspace: workspaceId,
                            performedBy: userId,
                            type: "OUT",
                            quantity: item.quantity,
                            previousQuantity,
                            newQuantity: updatedProduct.stockQuantity,
                            reason: "Stock deducted for sale",
                        },
                    ],
                    { session },
                );
            }

            const [sale] = await Sale.create(
                [
                    {
                        workspace: workspaceId,
                        soldBy: userId,
                        items: saleItems,
                        subtotal,
                        total: subtotal,
                    },
                ],
                { session },
            );

            if (!sale) {
                throw new AppError(500, "Sale could not be created");
            }

            createdSale = sale.toObject();
        });

        if (!createdSale) {
            throw new AppError(500, "Sale could not be created");
        }

        return { sale: createdSale };
    } finally {
        await session.endSession();
    }
}