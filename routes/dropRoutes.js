import express from "express";
import { getDrops } from "../controllers/dropControllers/getDropsController.js";
import { addDrop } from "../controllers/dropControllers/addDropController.js";

const router = express.Router();

router.get("/all-drops", getDrops);
router.post("/push-drop", addDrop);

export default router;
