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
import { productDemandForecastController } from "./sale-forecast.controller.js";

const salesRoutes = Router();

salesRoutes.use(authenticate);

salesRoutes.post(
    "/",
    validateBody(createSaleSchema),
    createSaleController,
);

salesRoutes.get("/", listSalesController);

salesRoutes.get("/analytics/summary", salesSummaryController);

salesRoutes.get(
    "/analytics/daily",
    dailySalesAnalyticsController,
);

salesRoutes.get("/analytics/forecast", productDemandForecastController);

salesRoutes.get("/:saleId", getSaleByIdController);

export default salesRoutes;