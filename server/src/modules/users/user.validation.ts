import { z } from "zod";

const emailSchema = z
    .string()
    .trim()
    .email("Please provide a valid email address")
    .max(254)
    .transform((email) => email.toLowerCase());

const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password cannot exceed 72 characters");

export const registerUserSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(2, "Name must be at least 2 characters")
            .max(80, "Name cannot exceed 80 characters"),

        email: emailSchema,

        password: passwordSchema,
    })
    .strict();

export const loginUserSchema = z
    .object({
        email: emailSchema,
        password: z.string().min(1, "Password is required").max(72),
    })
    .strict();

export const updateUserSchema = z
    .object({
        name: z
            .string()
            .trim()
            .min(2)
            .max(80)
            .optional(),
    })
    .strict();

export type RegisterUserInput = z.infer<
    typeof registerUserSchema
>;

export type LoginUserInput = z.infer<
    typeof loginUserSchema
>;

export type UpdateUserInput = z.infer<
    typeof updateUserSchema
>;