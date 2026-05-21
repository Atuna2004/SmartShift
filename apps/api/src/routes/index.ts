import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route.js";

const router = Router();

router.use("/auth", AuthRoutes);

export default router;
