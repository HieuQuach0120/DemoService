import express from "express";
import AuthenController from "../controllers/AuthenController";
const router = express.Router();
router.use("/authen", AuthenController);

export default router;
