import express from "express";
const router = express.Router();

import { createQuickEnquiry } from "../controllers/quickenquiryController.js";

router.post("/", createQuickEnquiry);

export default router;
