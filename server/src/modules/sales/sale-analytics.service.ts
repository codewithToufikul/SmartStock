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

    // Today সহ মোট `days`টি calendar day অন্তর্ভুক্ত হবে।
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (days - 1));

    const rows = await Sale.aggregate([
        {
            $match: {
                workspace: workspaceObjectId,
                createdAt: {
                    $gte: start,
                    $lte: end,
                },
            },
        },
        { $unwind: "$items" },
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: "%Y-%m-%d",
                        date: "$createdAt",
                    },
                },
                revenue: { $sum: "$items.lineTotal" },
                unitsSold: { $sum: "$items.quantity" },
                cost: {
                    $sum: {
                        $multiply: [
                            "$items.unitCost",
                            "$items.quantity",
                        ],
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

    return { days, dailySales: rows };
}