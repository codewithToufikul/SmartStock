import mongoose, { Schema, model, type Model, type Types } from "mongoose";

export interface IRefreshToken {
    user: Types.ObjectId;
    tokenHash: string;
    expiresAt: Date;
    revokedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        tokenHash: {
            type: String,
            required: true,
            unique: true,
            select: false,
        },

        expiresAt: {
            type: Date,
            required: true,
        },

        revokedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken: Model<IRefreshToken> =
    (mongoose.models.RefreshToken as Model<IRefreshToken>) ??
    model<IRefreshToken>("RefreshToken", refreshTokenSchema);