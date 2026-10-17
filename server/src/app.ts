import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import {
    errorHandler,
    notFoundHandler,
} from "./middleware/error-handler.js";

const app = express()

app.use(
    cors({
        origin: env.CLIENT_URL,
        credentials: true,
    }),
);

app.use(helmet())
app.use(express.json({ limit: "10kb" }))
app.use(express.urlencoded({ extended: true, limit: "10kb" }))
app.use(cookieParser())

app.get("/api/v1/health", (_req, res) => {
    res.status(200).json({
        success: true,
        message: "SmartStock API is running",
        data: {
            status: "ok",
        },
    });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;