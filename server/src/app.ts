import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import {
    errorHandler,
    notFoundHandler,
} from "./middleware/error-handler.js";
import authRouter from "./modules/auth/auth.routes.js";
import productRoute from "./modules/products/product.routes.js";
import stockMovementRoutes from "./modules/stock-movements/stock-movement.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";

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

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/products", productRoute);
app.use("/api/v1/stock-movements", stockMovementRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;