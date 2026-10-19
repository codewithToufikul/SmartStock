import mongoose, { Schema, model, type Model, type Types } from "mongoose";

export interface ICategory {
    name: string;
    description?: string;
    workspace: Types.ObjectId;
    isArchived: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
    {
        name: {
            type: String,
            required: [true, "Category name is required"],
            trim: true,
            minlength: 1,
            maxlength: 100,
        },
        description: {
            type: String,
            trim: true,
            maxlength: 500,
            default: "",
        },
        workspace: {
            type: Schema.Types.ObjectId,
            ref: "Workspace",
            required: true,
            index: true,
        },
        isArchived: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

categorySchema.index(
    { workspace: 1, name: 1 },
    { unique: true },
);

export const Category: Model<ICategory> =
    (mongoose.models.Category as Model<ICategory>) ??
    model<ICategory>("Category", categorySchema);
