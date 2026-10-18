import mongoose, { Schema, model, type Types, type Model } from "mongoose";

export interface IWorkspace {
    name: string;
    owner: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const workspaceSchema = new Schema<IWorkspace>(
    {
        name: {
            type: String,
            required: [true, "Workspace name is required"],
            trim: true,
            minlength: [2, "Workspace name must be at least 2 characters"],
            maxlength: [100, "Workspace name cannot exceed 100 characters"],
        },

        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Workspace owner is required"],
            index: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

export const Workspace: Model<IWorkspace> =
    (mongoose.models.Workspace as Model<IWorkspace>) ??
    model<IWorkspace>("Workspace", workspaceSchema);