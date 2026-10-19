import mongoose, { Schema, model, type Model, type Types } from "mongoose";

export interface ISaleItem {
    product: Types.ObjectId;
    name: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    unitCost: number;
    lineTotal: number;
}

export interface ISale {
    workspace: Types.ObjectId;
    soldBy: Types.ObjectId;
    items: ISaleItem[];
    subtotal: number;
    total: number;
    status: "COMPLETED" | "CANCELLED";
    saleNumber?: string;
    createdAt: Date;
    updatedAt: Date;
}

const saleItemSchema = new Schema<ISaleItem>(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        sku: {
            type: String,
            required: true,
            trim: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
            validate: {
                validator: Number.isInteger,
                message: "Quantity must be an integer",
            },
        },
        unitPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        unitCost: {
            type: Number,
            required: true,
            min: 0,
        },
        lineTotal: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    { _id: false },
);

const saleSchema = new Schema<ISale>(
    {
        workspace: {
            type: Schema.Types.ObjectId,
            ref: "Workspace",
            required: true,
            index: true,
        },
        soldBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        items: {
            type: [saleItemSchema],
            required: true,
            validate: {
                validator: (items: ISaleItem[]) => items.length > 0,
                message: "A sale must contain at least one item",
            },
        },
        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },
        total: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: ["COMPLETED", "CANCELLED"],
            default: "COMPLETED",
            index: true,
        },
        saleNumber: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true, versionKey: false },
);

saleSchema.index({ workspace: 1, createdAt: -1 });

export const Sale: Model<ISale> =
    (mongoose.models.Sale as Model<ISale>) ??
    model<ISale>("Sale", saleSchema);