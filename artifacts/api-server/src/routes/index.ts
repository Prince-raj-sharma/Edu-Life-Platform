import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import coursesRouter from "./courses";
import pdfsRouter from "./pdfs";
import paymentsRouter from "./payments";
import ordersRouter from "./orders";
import adminRouter from "./admin";
import uploadRouter from "./upload";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(coursesRouter);
router.use(pdfsRouter);
router.use(paymentsRouter);
router.use(ordersRouter);
router.use(adminRouter);
router.use(uploadRouter);

export default router;
