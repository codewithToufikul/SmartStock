import { Router } from "express";
import { validateBody } from "../../middleware/validate-request.js";
import { loginUserSchema, registerUserSchema } from "../users/user.validation.js";
import {
    getMeController,
    loginController,
    logoutController,
    refreshController,
    registerController,
} from "./auth.controller.js";
import { authenticate } from "../../middleware/authenticate.js";

const authRouter = Router();

authRouter.post(
    "/register",
    validateBody(registerUserSchema),
    registerController,
);

authRouter.post(
    "/login",
    validateBody(loginUserSchema),
    loginController,
);

authRouter.get(
    "/me",
    authenticate,
    getMeController,
);

authRouter.post("/refresh", refreshController);
authRouter.post("/logout", logoutController);

export default authRouter;