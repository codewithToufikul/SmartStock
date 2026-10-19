import mongoose from "mongoose";
import { Product } from "../products/product.model.js";
import { Sale } from "./sale.model.js";

export async function getProductDemandForecast(
    workspaceId: string,
    days = 30,
) {
    const workspaceObjectId = new mongoose.Types.ObjectId(workspaceId);

    const end = new Date();
    end.setUTCHours(23, 59, 59, 999);

    const start = new Date(end);
    start.setUTCHours(0, 0, 0, 0);
    start.setUTCDate(start.getUTCDate() - (days - 1));

    const productDemand = await Sale.aggregate([
        {
            $match: {
                workspace: workspaceObjectId,
                status: { $ne: "CANCELLED" },
                createdAt: { $gte: start, $lte: end },
            },
        },
        { $unwind: "$items" },
        {
            $group: {
                _id: "$items.product",
                totalUnitsSold: { $sum: "$items.quantity" },
            },
        },
    ]);

    const demandByProduct = new Map<string, number>(
        productDemand.map((item) => [
            String(item._id),
            item.totalUnitsSold,
        ]),
    );

    const products = await Product.find({
        workspace: workspaceObjectId,
        isArchived: { $ne: true },
    })
        .select("_id name sku stockQuantity lowStockThreshold leadTimeDays safetyStock")
        .sort({ name: 1 })
        .lean();

    const forecasts = products.map((product) => {
        const totalUnitsSold = demandByProduct.get(String(product._id)) ?? 0;
        const averageDailyDemand = totalUnitsSold / days;

        const estimatedDaysRemaining =
            averageDailyDemand > 0
                ? Math.round((product.stockQuantity / averageDailyDemand) * 100) / 100
                : null;

        const leadTime = product.leadTimeDays ?? 0;
        const safetyStock = product.safetyStock ?? 0;

        // SRS Reorder Point formula: ROP = ceil(d_hat * L) + SS
        const reorderPoint = Math.ceil(averageDailyDemand * leadTime) + safetyStock;

        // Suggested restock quantity Q
        const needsRestock = product.stockQuantity <= reorderPoint || product.stockQuantity <= product.lowStockThreshold;
        const suggestedRestock = needsRestock
            ? Math.max(1, Math.max(reorderPoint, product.lowStockThreshold * 2) - product.stockQuantity)
            : 0;

        return {
            productId: String(product._id),
            name: product.name,
            sku: product.sku,
            currentStock: product.stockQuantity,
            totalUnitsSold,
            averageDailyDemand: Math.round(averageDailyDemand * 100) / 100,
            estimatedDaysRemaining,
            leadTimeDays: leadTime,
            safetyStock,
            reorderPoint,
            needsRestock,
            suggestedRestock,
            lowStock: product.stockQuantity <= product.lowStockThreshold,
        };
    });

    return {
        periodDays: days,
        forecasts,
    };
}