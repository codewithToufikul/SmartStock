import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.js";
import { validateBody } from "../../middleware/validate-request.js";

import {
    createStockMovementController,
    stockMovementHistoryController,
} from "./stock-movement.controller.js";

import {
    createStockMovementSchema,
} from "./stock-movement.validation.js";

const stockMovementRoutes = Router();

stockMovementRoutes.use(authenticate);

stockMovementRoutes.post(
    "/",
    validateBody(createStockMovementSchema),
    createStockMovementController,
);

stockMovementRoutes.get(
    "/:productId/history",
    stockMovementHistoryController,
);

export default stockMovementRoutes;