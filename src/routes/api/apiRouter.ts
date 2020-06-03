import { Router } from "express";
import handleSubmitRouter from "./handleSubmit/handleSubmitRouter";

const router = Router();

router.use("/handleSubmit", handleSubmitRouter);

export default router;