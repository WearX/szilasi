import { Router } from "express";
import verifyToken from "../middleware/auth";
import { getMessages, createMessage, deleteMessages } from "./messageController";

const router = Router();

router.get("/messages", verifyToken, getMessages);
router.post("/messages", verifyToken, createMessage);
router.delete("/messages", verifyToken, deleteMessages);

export default router;
