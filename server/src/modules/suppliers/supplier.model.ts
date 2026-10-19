import mongoose, { Schema, model, type Model, type Types } from "mongoose";

export interface ISupplier {
    name: string;
    contactPerson?: string | undefined;
    phone?: string | undefined;
    email?: string | undefined;
    address?: string | undefined;
    notes?: string | undefined;
    workspace: Types.ObjectId;
    isArchived: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const supplierSchema = new Schema<ISupplier>(
    {
        name: {
            type: String,
            required: [true, "Supplier name is required"],
            trim: true,
            minlength: 1,
            maxlength: 150,
        },
        contactPerson: {
            type: String,
            trim: true,
            maxlength: 100,
            default: "",
        },
        phone: {
            type: String,
            trim: true,
            maxlength: 50,
            default: "",
        },
        email: {
            type: String,
            trim: true,
            maxlength: 254,
            default: "",
        },
        address: {
            type: String,
            trim: true,
            maxlength: 300,
            default: "",
        },
        notes: {
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

supplierSchema.index(
    { workspace: 1, name: 1 },
    { unique: true },
);

export const Supplier: Model<ISupplier> =
    (mongoose.models.Supplier as Model<ISupplier>) ??
    model<ISupplier>("Supplier", supplierSchema);
