import mongoose from "mongoose";
import { Sale } from "./sale.model.js";

export async function getSalesSummary(workspaceId: string) {
    const objectId = new mongoose.Types.ObjectId(workspaceId);

    const [result] = await Sale.aggregate([
        {
            $match: {
                workspace: objectId,
            },
        },
        {
            $unwind: "$items",
        },
        {
            $group: {
                _id: null,
                totalSalesRevenue: { $sum: "$items.lineTotal" },
                totalUnitsSold: { $sum: "$items.quantity" },
                totalCost: {
                    $sum: {
                        $multiply: ["$items.unitCost", "$items.quantity"],
                    },
                },
                salesCount: { $addToSet: "$_id" },
            },
        },
        {
            $project: {
                _id: 0,
                totalSalesRevenue: { $round: ["$totalSalesRevenue", 2] },
                totalUnitsSold: 1,
                totalCost: { $round: ["$totalCost", 2] },
                grossProfit: {
                    $round: [
                        { $subtract: ["$totalSalesRevenue", "$totalCost"] },
                        2,
                    ],
                },
                totalSales: { $size: "$salesCount" },
            },
        },
    ]);

    return {
        summary: result ?? {
            totalSalesRevenue: 0,
            totalUnitsSold: 0,
            totalCost: 0,
            grossProfit: 0,
            totalSales: 0,
        },
    };
}

export async function getDailySalesAnalytics(
    workspaceId: string,
    days: number,
) {
    const workspaceObjectId = new mongoose.Types.ObjectId(workspaceId);

    const end = new Date();
    end.setUTCHours(23, 59, 59, 999);

    const start = new Date(end);
    start.setUTCHours(0, 0, 0, 0);
    start.setUTCDate(start.getUTCDate() - (days - 1));

    const rows = await Sale.aggregate([
        {
            $match: {
                workspace: workspaceObjectId,
                createdAt: { $gte: start, $lte: end },
            },
        },
        { $unwind: "$items" },
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: "%Y-%m-%d",
                        date: "$createdAt",
                        timezone: "UTC",
                    },
                },
                revenue: { $sum: "$items.lineTotal" },
                unitsSold: { $sum: "$items.quantity" },
                cost: {
                    $sum: {
                        $multiply: ["$items.unitCost", "$items.quantity"],
                    },
                },
                saleIds: { $addToSet: "$_id" },
            },
        },
        {
            $project: {
                _id: 0,
                date: "$_id",
                revenue: { $round: ["$revenue", 2] },
                unitsSold: 1,
                grossProfit: {
                    $round: [{ $subtract: ["$revenue", "$cost"] }, 2],
                },
                salesCount: { $size: "$saleIds" },
            },
        },
        { $sort: { date: 1 } },
    ]);

    const salesByDate = new Map(
        rows.map((row) => [row.date, row]),
    );

    const dailySales = [];

    for (let i = 0; i < days; i++) {
        const date = new Date(start);
        date.setUTCDate(start.getUTCDate() + i);

        const dateKey = date.toISOString().slice(0, 10);
        const row = salesByDate.get(dateKey);

        dailySales.push(
            row ?? {
                date: dateKey,
                revenue: 0,
                unitsSold: 0,
                grossProfit: 0,
                salesCount: 0,
            },
        );
    }

    return { days, dailySales };
}