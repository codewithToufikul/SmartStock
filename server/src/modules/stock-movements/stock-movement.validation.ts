import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ID");

const reason = z.string().trim().min(2).max(300);

export const createStockMovementSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("IN"),
        productId: objectId,
        quantity: z.number().int().positive(),
        reason,
    }).strict(),

    z.object({
        type: z.literal("OUT"),
        productId: objectId,
        quantity: z.number().int().positive(),
        reason,
    }).strict(),

    z.object({
        type: z.literal("ADJUSTMENT"),
        productId: objectId,
        newQuantity: z.number().int().min(0),
        reason,
    }).strict(),
]);

export const movementHistoryParamsSchema = z.object({
    productId: objectId,
});

export type CreateStockMovementInput =
    z.infer<typeof createStockMovementSchema>;