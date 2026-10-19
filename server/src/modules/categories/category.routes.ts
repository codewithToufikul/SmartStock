import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { validateBody } from "../../middleware/validate-request.js";
import {
    createCategoryController,
    listCategoriesController,
    getCategoryController,
    updateCategoryController,
    archiveCategoryController,
} from "./category.controller.js";
import {
    createCategorySchema,
    updateCategorySchema,
} from "./category.validation.js";

const categoryRoutes = Router();

categoryRoutes.use(authenticate);

categoryRoutes.get("/", listCategoriesController);
categoryRoutes.post("/", validateBody(createCategorySchema), createCategoryController);
categoryRoutes.get("/:id", getCategoryController);
categoryRoutes.patch("/:id", validateBody(updateCategorySchema), updateCategoryController);
categoryRoutes.delete("/:id", archiveCategoryController);

export default categoryRoutes;
