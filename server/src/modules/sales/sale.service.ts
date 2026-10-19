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

            const saleNumber = `INV-${Date.now().toString().slice(-6)}`;

            const [sale] = await Sale.create(
                [
                    {
                        workspace: workspaceId,
                        soldBy: userId,
                        items: saleItems,
                        subtotal,
                        total: subtotal,
                        status: "COMPLETED",
                        saleNumber,
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

export async function cancelSale(
    workspaceId: string,
    userId: string,
    saleId: string,
    reason = "Customer return / Sale cancelled",
) {
    const session = await mongoose.startSession();

    try {
        let updatedSale: any;

        await session.withTransaction(async () => {
            const sale = await Sale.findOne({
                _id: saleId,
                workspace: workspaceId,
            }).session(session);

            if (!sale) {
                throw new AppError(404, "Sale not found");
            }

            if (sale.status === "CANCELLED") {
                throw new AppError(400, "This sale has already been cancelled and reversed");
            }

            // Restore stock for all items atomically
            for (const item of sale.items) {
                const product = await Product.findOne({
                    _id: item.product,
                    workspace: workspaceId,
                }).session(session);

                if (product) {
                    const previousQuantity = product.stockQuantity;
                    const newQuantity = previousQuantity + item.quantity;

                    await Product.updateOne(
                        { _id: product._id },
                        { $inc: { stockQuantity: item.quantity } },
                        { session },
                    );

                    await StockMovement.create(
                        [
                            {
                                product: product._id,
                                workspace: workspaceId,
                                performedBy: userId,
                                type: "SALE_REVERSAL",
                                quantity: item.quantity,
                                previousQuantity,
                                newQuantity,
                                reason: `Reversal for ${sale.saleNumber || sale._id}: ${reason}`,
                            },
                        ],
                        { session },
                    );
                }
            }

            sale.status = "CANCELLED";
            await sale.save({ session });
            updatedSale = sale.toObject();
        });

        return { sale: updatedSale };
    } finally {
        await session.endSession();
    }
}