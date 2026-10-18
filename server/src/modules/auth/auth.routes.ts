import { Router } from "express"
import { validateBody } from "../../middleware/validate-request.js";
import { loginUserSchema, registerUserSchema } from "../users/user.validation.js";
import { getMeController, loginController, logoutController, refreshController, registerController } from "./auth.controller.js";
import { authenticate } from "../../middleware/authenticate.js";

const authRouter = Router();

// register route
authRouter.post(
    "/register",
    validateBody(registerUserSchema),
    registerController,
);

// login route
authRouter.post(
    "/login",
    validateBody(loginUserSchema),
    loginController,
);

// get current user
authRouter.get(
    "/me",
    authenticate,
    getMeController,
);

// refresh token route
authRouter.post("/refresh", refreshController);

// logout route
authRouter.post("/logout", logoutController);

export default authRouter;