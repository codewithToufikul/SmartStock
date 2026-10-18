import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),

    PORT: z.coerce.number().int().positive().default(5000),

    CLIENT_URL: z.string().url(),

    MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

    JWT_SECRET: z
        .string()
        .min(32, "JWT_SECRET must be at least 32 characters"),

    JWT_REFRESH_SECRET: z
        .string()
        .min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),

    JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),

    JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
    console.error("Invalid environment configuration:");
    console.error(result.error.flatten().fieldErrors);
    process.exit(1);
}

export const env = result.data;