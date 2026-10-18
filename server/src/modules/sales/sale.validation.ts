import { z } from "zod";

export const createSaleSchema = z
    .object({
        items: z
            .array(
                z
                    .object({
                        productId: z
                            .string()
                            .regex(/^[a-f\d]{24}$/i, "Invalid product ID"),
                        quantity: z
                            .number()
                            .int("Quantity must be an integer")
                            .positive("Quantity must be greater than zero")
                            .max(1_000_000),
                    })
                    .strict(),
            )
            .min(1, "At least one item is required")
            .max(100, "A sale cannot contain more than 100 items"),
    })
    .strict()
    .superRefine((data, ctx) => {
        const productIds = data.items.map((item) => item.productId);

        if (new Set(productIds).size !== productIds.length) {
            ctx.addIssue({
                code: "custom",
                path: ["items"],
                message: "Each product can appear only once in a sale",
            });
        }
    });

export const listSalesQuerySchema = z
    .object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
    })
    .strict();

export type CreateSaleInput = z.infer<typeof createSaleSchema>;
export type ListSalesQuery = z.infer<typeof listSalesQuerySchema>;