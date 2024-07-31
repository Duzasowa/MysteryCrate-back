import express from "express";
import { registerController } from "../controllers/authControllers/registerController.js";
import { loginController } from "../controllers/authControllers/loginController.js";

const router = express.Router();

router.post("/register", registerController);
router.post("/login", loginController);

export default router;
