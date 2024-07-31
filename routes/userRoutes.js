import express from "express";
import { getUserProfile } from "../controllers/userControllers/getUserController.js";
import { protect } from "../utils/authMiddleware.js";

const router = express.Router();

router.get("/profile", protect, getUserProfile);

export default router;
