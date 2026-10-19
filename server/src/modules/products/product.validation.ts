import { z } from "zod";

const productName = z.string().trim().min(2).max(150);
const sku = z.string().trim().min(1).max(64).transform(
    (value) => value.toUpperCase(),
);
const description = z.string().trim().max(1000).optional();

const nonNegativePrice = z.number().finite().min(0);
const nonNegativeInteger = z.number().int().min(0);

const optionalObjectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ID").optional().nullable();

export const createProductSchema = z.object({
    name: productName,
    sku,
    description,
    costPrice: nonNegativePrice,
    sellingPrice: nonNegativePrice,
    stockQuantity: nonNegativeInteger.optional().default(0),
    lowStockThreshold: nonNegativeInteger.optional().default(5),
    category: optionalObjectId,
    supplier: optionalObjectId,
    leadTimeDays: nonNegativeInteger.optional().default(0),
    safetyStock: nonNegativeInteger.optional().default(0),
}).strict();

export const updateProductSchema = z.object({
    name: productName.optional(),
    sku: sku.optional(),
    description,
    costPrice: nonNegativePrice.optional(),
    sellingPrice: nonNegativePrice.optional(),
    stockQuantity: nonNegativeInteger.optional(),
    lowStockThreshold: nonNegativeInteger.optional(),
    category: optionalObjectId,
    supplier: optionalObjectId,
    leadTimeDays: nonNegativeInteger.optional(),
    safetyStock: nonNegativeInteger.optional(),
}).strict().refine(
    (data) => Object.keys(data).length > 0,
    { message: "At least one field must be provided" },
);

export const productIdSchema = z.object({
    productId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid product ID"),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;