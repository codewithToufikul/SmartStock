import mongoose, { Schema, model, type Model, type Types } from "mongoose";

export interface IProduct {
    name: string;
    sku: string;
    description?: string | undefined;
    costPrice: number;
    sellingPrice: number;
    stockQuantity: number;
    lowStockThreshold: number;
    workspace: Types.ObjectId;
    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
    {
        name: {
            type: String,
            required: [true, "Product name is required"],
            trim: true,
            minlength: 2,
            maxlength: 150,
        },

        sku: {
            type: String,
            required: [true, "SKU is required"],
            trim: true,
            uppercase: true,
            maxlength: 64,
        },

        description: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: "",
        },

        costPrice: {
            type: Number,
            required: true,
            min: 0,
        },

        sellingPrice: {
            type: Number,
            required: true,
            min: 0,
        },

        stockQuantity: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
            validate: {
                validator: Number.isInteger,
                message: "Stock quantity must be an integer",
            },
        },

        lowStockThreshold: {
            type: Number,
            required: true,
            min: 0,
            default: 5,
            validate: {
                validator: Number.isInteger,
                message: "Low-stock threshold must be an integer",
            },
        },

        workspace: {
            type: Schema.Types.ObjectId,
            ref: "Workspace",
            required: true,
            index: true,
        },

        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

productSchema.index(
    { workspace: 1, sku: 1 },
    { unique: true },
);

export const Product: Model<IProduct> =
    (mongoose.models.Product as Model<IProduct>) ??
    model<IProduct>("Product", productSchema);