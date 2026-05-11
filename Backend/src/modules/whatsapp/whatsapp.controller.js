/**
 * WhatsApp Controller
 * Handles incoming WhatsApp message send requests
 * Validates request body and delegates to service layer
 */

import { sendWhatsAppMessage } from "./whatsapp.services.js";

/**
 * Send a WhatsApp message
 * POST /whatsapp/send
 * @param {Object} req - Express request object
 * @param {String} req.body.phone - Recipient phone number (format: 573001112233)
 * @param {String} req.body.message - Message text to send
 * @param {Object} res - Express response object
 */
export const sendMessage = async (req, res) => {
  try {
    const { phone, message } = req.body;

    // Validate required fields
    if (!phone || !message) {
      return res.status(400).json({
        ok: false,
        error: "Phone and message are required",
      });
    }

    // Validate phone format (basic validation for international format)
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ""))) {
      return res.status(400).json({
        ok: false,
        error: "Invalid phone number format",
      });
    }

    // Validate message is not empty or just whitespace
    if (message.trim().length === 0) {
      return res.status(400).json({
        ok: false,
        error: "Message cannot be empty",
      });
    }

    // Call service to send WhatsApp message
    const result = await sendWhatsAppMessage(phone, message);

    return res.status(200).json({
      ok: true,
      message: "WhatsApp message sent successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);

    // Determine error status code based on error type
    let statusCode = 500;
    let errorMessage = error.message || "Failed to send WhatsApp message";

    if (error.message.includes("token")) {
      statusCode = 401;
      errorMessage = "Invalid WhatsApp API token";
    } else if (error.message.includes("phone")) {
      statusCode = 400;
      errorMessage = "Invalid phone number";
    }

    return res.status(statusCode).json({
      ok: false,
      error: errorMessage,
    });
  }
};