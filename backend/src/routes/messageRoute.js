import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import {
  getMessages,
  getUserForSidebar,
  SendMessage,
} from "../controllers/messageController.js";

const router = express.Router();

router.get("/user", protectRoute, getUserForSidebar);
router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, SendMessage);

export default router;
