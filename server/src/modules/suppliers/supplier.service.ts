import mongoose from "mongoose";
import { Supplier } from "./supplier.model.js";
import { Product } from "../products/product.model.js";
import type { CreateSupplierInput, UpdateSupplierInput } from "./supplier.validation.js";
import { AppError } from "../../utils/app-error.js";

interface Actor {
    userId: string;
    workspaceId: string;
}

export async function createSupplier(actor: Actor, input: CreateSupplierInput) {
    try {
        const supplier = await Supplier.create({
            name: input.name,
            contactPerson: input.contactPerson ?? "",
            phone: input.phone ?? "",
            email: input.email ?? "",
            address: input.address ?? "",
            notes: input.notes ?? "",
            workspace: new mongoose.Types.ObjectId(actor.workspaceId),
            isArchived: false,
        });

        return { supplier };
    } catch (error: unknown) {
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === 11000
        ) {
            throw new AppError(409, "A supplier with this name already exists in your workspace");
        }
        throw error;
    }
}

export async function listSuppliers(actor: Actor, search?: string, includeArchived = false) {
    const filter: Record<string, unknown> = {
        workspace: new mongoose.Types.ObjectId(actor.workspaceId),
    };

    if (!includeArchived) {
        filter.isArchived = false;
    }

    if (search && search.trim()) {
        const searchRegex = new RegExp(search.trim(), "i");
        filter.$or = [
            { name: searchRegex },
            { contactPerson: searchRegex },
            { phone: searchRegex },
            { email: searchRegex },
        ];
    }

    const suppliers = await Supplier.find(filter).sort({ name: 1 });

    return {
        suppliers,
        total: suppliers.length,
    };
}

export async function getSupplierById(actor: Actor, supplierId: string) {
    if (!mongoose.Types.ObjectId.isValid(supplierId)) {
        throw new AppError(400, "Invalid supplier ID");
    }

    const supplier = await Supplier.findOne({
        _id: supplierId,
        workspace: actor.workspaceId,
    });

    if (!supplier) {
        throw new AppError(404, "Supplier not found");
    }

    return { supplier };
}

export async function updateSupplier(
    actor: Actor,
    supplierId: string,
    input: UpdateSupplierInput,
) {
    if (!mongoose.Types.ObjectId.isValid(supplierId)) {
        throw new AppError(400, "Invalid supplier ID");
    }

    try {
        const supplier = await Supplier.findOneAndUpdate(
            {
                _id: supplierId,
                workspace: actor.workspaceId,
            },
            { $set: input },
            { new: true, runValidators: true },
        );

        if (!supplier) {
            throw new AppError(404, "Supplier not found");
        }

        return { supplier };
    } catch (error: unknown) {
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === 11000
        ) {
            throw new AppError(409, "A supplier with this name already exists in your workspace");
        }
        throw error;
    }
}

export async function archiveSupplier(actor: Actor, supplierId: string) {
    if (!mongoose.Types.ObjectId.isValid(supplierId)) {
        throw new AppError(400, "Invalid supplier ID");
    }

    const productUsingSupplier = await Product.findOne({
        workspace: actor.workspaceId,
        supplier: supplierId,
        isArchived: { $ne: true },
    }).select("_id name");

    if (productUsingSupplier) {
        throw new AppError(
            409,
            `Cannot archive supplier because product "${productUsingSupplier.name}" is using it. Please reassign the product first.`,
        );
    }

    const supplier = await Supplier.findOneAndUpdate(
        {
            _id: supplierId,
            workspace: actor.workspaceId,
        },
        { $set: { isArchived: true } },
        { new: true },
    );

    if (!supplier) {
        throw new AppError(404, "Supplier not found");
    }

    return { supplier, message: "Supplier archived successfully" };
}
