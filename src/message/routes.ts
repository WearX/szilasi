import { Router } from "express";
import verifyToken from "../middleware/auth";
import { getMessages, createMessage, deleteMessages, uploadChatImage } from "./messageController";

const router = Router();

router.get("/messages", verifyToken, getMessages);
router.post("/messages", verifyToken, createMessage);
router.post("/messages/image", verifyToken, uploadChatImage);
router.delete("/messages", verifyToken, deleteMessages);

export default router;
