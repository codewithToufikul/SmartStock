import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { validateBody } from "../../middleware/validate-request.js";
import {
    createSupplierController,
    listSuppliersController,
    getSupplierController,
    updateSupplierController,
    archiveSupplierController,
} from "./supplier.controller.js";
import {
    createSupplierSchema,
    updateSupplierSchema,
} from "./supplier.validation.js";

const supplierRoutes = Router();

supplierRoutes.use(authenticate);

supplierRoutes.get("/", listSuppliersController);
supplierRoutes.post("/", validateBody(createSupplierSchema), createSupplierController);
supplierRoutes.get("/:id", getSupplierController);
supplierRoutes.patch("/:id", validateBody(updateSupplierSchema), updateSupplierController);
supplierRoutes.delete("/:id", archiveSupplierController);

export default supplierRoutes;
