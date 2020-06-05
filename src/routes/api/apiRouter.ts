import { Router } from "express";
import assetsRouter from "./assets/assetsRouter";

const router = Router();

router.use("/assets", assetsRouter);

export default router;