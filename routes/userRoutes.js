import express from "express";
import { getUserController } from "../controllers/userControllers/getUserController.js";
import { protect } from "../utils/authMiddleware.js";
import { getAllUsersController } from "../controllers/userControllers/getAllUsersController.js";

const router = express.Router();

router.get("/profile", protect, getUserController);
router.get("/getAllUsers", getAllUsersController);

export default router;
