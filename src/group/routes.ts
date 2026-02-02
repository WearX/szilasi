import { Router } from "express";
import verifyToken from "../middleware/auth";
import { createGroup, getUserGroups } from "./groupController";

const router = Router();
router.post("/groups", verifyToken, createGroup);
router.get("/groups", verifyToken, getUserGroups);

export default router;