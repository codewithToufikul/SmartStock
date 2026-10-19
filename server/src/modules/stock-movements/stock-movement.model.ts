import mongoose, { Schema, model, type Types, type Model } from "mongoose";

export const StockMovementType = {
    IN: "IN",
    OUT: "OUT",
    ADJUSTMENT: "ADJUSTMENT",
    SALE_REVERSAL: "SALE_REVERSAL",
} as const;

export type StockMovementType =
    (typeof StockMovementType)[keyof typeof StockMovementType];

export interface IStockMovement {
    product: Types.ObjectId;
    workspace: Types.ObjectId;
    performedBy: Types.ObjectId;
    type: StockMovementType;
    quantity: number;
    previousQuantity: number;
    newQuantity: number;
    reason: string;
    createdAt: Date;
    updatedAt: Date;
}

const stockMovementSchema = new Schema<IStockMovement>(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true,
        },
        workspace: {
            type: Schema.Types.ObjectId,
            ref: "Workspace",
            required: true,
            index: true,
        },
        performedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            enum: Object.values(StockMovementType),
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
            validate: {
                validator: Number.isInteger,
                message: "Movement quantity must be an integer",
            },
        },
        previousQuantity: {
            type: Number,
            required: true,
            min: 0,
            validate: {
                validator: Number.isInteger,
                message: "Previous quantity must be an integer",
            },
        },
        newQuantity: {
            type: Number,
            required: true,
            min: 0,
            validate: {
                validator: Number.isInteger,
                message: "New quantity must be an integer",
            },
        },
        reason: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 300,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

stockMovementSchema.index({ workspace: 1, createdAt: -1 });
stockMovementSchema.index({ product: 1, createdAt: -1 });

export const StockMovement: Model<IStockMovement> =
    (mongoose.models.StockMovement as Model<IStockMovement>) ??
    model<IStockMovement>("StockMovement", stockMovementSchema);