import mongoose from "mongoose";

import { Product } from "../products/product.model.js";
import { AppError } from "../../utils/app-error.js";

export async function getDashboardSummary(workspaceId: string) {
    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
        throw new AppError(400, "Invalid workspace ID");
    }

    const workspaceObjectId = new mongoose.Types.ObjectId(workspaceId);

    const [summary] = await Product.aggregate([
        {
            $match: {
                workspace: workspaceObjectId,
            },
        },
        {
            $group: {
                _id: null,

                totalProducts: {
                    $sum: 1,
                },

                totalStockUnits: {
                    $sum: "$stockQuantity",
                },

                lowStockCount: {
                    $sum: {
                        $cond: [
                            {
                                $lte: [
                                    "$stockQuantity",
                                    "$lowStockThreshold",
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },

                outOfStockCount: {
                    $sum: {
                        $cond: [
                            { $eq: ["$stockQuantity", 0] },
                            1,
                            0,
                        ],
                    },
                },

                inventoryCostValue: {
                    $sum: {
                        $multiply: [
                            "$costPrice",
                            "$stockQuantity",
                        ],
                    },
                },

                potentialSellingValue: {
                    $sum: {
                        $multiply: [
                            "$sellingPrice",
                            "$stockQuantity",
                        ],
                    },
                },
            },
        },
        {
            $project: {
                _id: 0,
                totalProducts: 1,
                totalStockUnits: 1,
                lowStockCount: 1,
                outOfStockCount: 1,
                inventoryCostValue: 1,
                potentialSellingValue: 1,
            },
        },
    ]);

    return {
        summary: summary ?? {
            totalProducts: 0,
            totalStockUnits: 0,
            lowStockCount: 0,
            outOfStockCount: 0,
            inventoryCostValue: 0,
            potentialSellingValue: 0,
        },
    };
}