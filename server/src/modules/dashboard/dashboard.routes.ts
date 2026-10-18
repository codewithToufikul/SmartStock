import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.js";
import { dashboardSummaryController } from "./dashboard.controller.js";

const dashboardRoutes = Router();

dashboardRoutes.use(authenticate);

dashboardRoutes.get("/summary", dashboardSummaryController);

export default dashboardRoutes;