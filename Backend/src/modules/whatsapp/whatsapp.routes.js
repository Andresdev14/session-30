/**
 * WhatsApp Routes
 * Handles all WhatsApp API endpoints
 * Routes are mounted at /whatsapp
 */

import express from "express";
import { sendMessage } from "./whatsapp.controller.js";

const router = express.Router();

/**
 * POST /whatsapp/send
 * Send a WhatsApp message
 * @body {String} phone - Recipient phone number
 * @body {String} message - Message text
 * @returns {Object} {ok: boolean, message: string, data: Object}
 */
router.post("/send", sendMessage);

export default router;
