import { Router } from "express";

import { authenticate } from "../../middleware/authenticate.js";
import { validateBody } from "../../middleware/validate-request.js";

import {
    createProductController,
    deleteProductController,
    getLowStockProductsController,
    getProductController,
    listProductsController,
    updateProductController,
} from "./product.controller.js";

import {
    createProductSchema,
    updateProductSchema,
} from "./product.validation.js";

const productRoute = Router();

productRoute.use(authenticate);

productRoute.post(
    "/",
    validateBody(createProductSchema),
    createProductController,
);

productRoute.get("/", listProductsController);

productRoute.get("/low-stock", getLowStockProductsController);

productRoute.get("/:productId", getProductController);

productRoute.patch(
    "/:productId",
    validateBody(updateProductSchema),
    updateProductController,
);

productRoute.delete("/:productId", deleteProductController);



export default productRoute;