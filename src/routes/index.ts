import express from "express";
import AuthenController from "../controllers/AuthenController";
import MemberController from "../controllers/MemberController";
const router = express.Router();
router.use("/authen", AuthenController);
router.use("/member", MemberController);

export default router;
