import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.js";
import { validateBody } from "../../middleware/validate-request.js";
import { createSaleSchema } from "./sale.validation.js";

import {
    createSaleController,
    listSalesController,
    getSaleByIdController,
} from "./sale.controller.js";
import { dailySalesAnalyticsController, salesSummaryController } from "./sale-analytics.controller.js";

const salesRoutes = Router();

salesRoutes.use(authenticate);

salesRoutes.post(
    "/",
    validateBody(createSaleSchema),
    createSaleController,
);

salesRoutes.get("/", listSalesController);

salesRoutes.get("/:saleId", getSaleByIdController);

salesRoutes.get("/analytics/summary", salesSummaryController);

salesRoutes.get(
    "/analytics/daily",
    dailySalesAnalyticsController,
);

export default salesRoutes;