import { z } from "zod";

export const createSupplierSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(1, "Supplier name is required")
            .max(150, "Supplier name cannot exceed 150 characters"),
        contactPerson: z.string().trim().max(100).optional(),
        phone: z.string().trim().max(50).optional(),
        email: z.string().trim().email("Invalid email address").max(254).optional().or(z.literal("")),
        address: z.string().trim().max(300).optional(),
        notes: z.string().trim().max(500).optional(),
    })
    .strict();

export const updateSupplierSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(1, "Supplier name cannot be empty")
            .max(150, "Supplier name cannot exceed 150 characters")
            .optional(),
        contactPerson: z.string().trim().max(100).optional(),
        phone: z.string().trim().max(50).optional(),
        email: z.string().trim().email("Invalid email address").max(254).optional().or(z.literal("")),
        address: z.string().trim().max(300).optional(),
        notes: z.string().trim().max(500).optional(),
    })
    .strict();

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
