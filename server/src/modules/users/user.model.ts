import mongoose, { Schema, model, type Types, type Model } from "mongoose";

export enum UserRole {
    OWNER = "OWNER",
    STAFF = "STAFF",
}

export interface IUser {
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    workspace: Types.ObjectId;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters"],
            maxlength: [80, "Name cannot exceed 80 characters"],
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            trim: true,
            lowercase: true,
            maxlength: [254, "Email cannot exceed 254 characters"],
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "Please provide a valid email address",
            ],
        },

        passwordHash: {
            type: String,
            required: [true, "Password hash is required"],
            select: false,
        },

        role: {
            type: String,
            enum: Object.values(UserRole),
            default: UserRole.STAFF,
            required: true,
        },

        workspace: {
            type: Schema.Types.ObjectId,
            ref: "Workspace",
            required: [true, "Workspace is required"],
            index: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

userSchema.index({ email: 1 }, { unique: true });

export const User: Model<IUser> =
    (mongoose.models.User as Model<IUser>) ?? model<IUser>("User", userSchema);