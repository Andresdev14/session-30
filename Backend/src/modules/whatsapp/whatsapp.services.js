/**
 * WhatsApp Services
 * Handles all communication with Meta WhatsApp Cloud API
 * Encapsulates WhatsApp API logic away from controllers
 */

/**
 * Send a WhatsApp message via Meta Cloud API
 * @param {String} phone - Recipient phone number (format: 573001112233)
 * @param {String} message - Message text to send
 * @returns {Object} API response data
 * @throws {Error} If API call fails
 */
export const sendWhatsAppMessage = async (phone, message) => {
  try {
    // Get configuration from environment variables
    const token = process.env.WHATSAPP_TOKEN;
    const phoneNumberId = process.env.PHONE_ID;

    // Validate that required environment variables are set
    if (!token) {
      throw new Error("WHATSAPP_TOKEN environment variable is not set");
    }

    if (!phoneNumberId) {
      throw new Error("PHONE_ID environment variable is not set");
    }

    // Build the Meta WhatsApp Cloud API URL
    // API version: v18.0 (latest stable as of 2026)
    const apiUrl = `https://graph.instagram.com/v18.0/${phoneNumberId}/messages`;

    // Prepare the request payload following Meta API specification
    const payload = {
      messaging_product: "whatsapp",
      to: phone,
      type: "text",
      text: {
        body: message,
      },
    };

    // Make the API call using fetch with Bearer token authentication
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // Parse the response
    const responseData = await response.json();

    // Handle API errors
    if (!response.ok) {
      throw new Error(
        responseData.error?.message ||
          `WhatsApp API error: ${response.status} ${response.statusText}`
      );
    }

    // Return successful response
    return responseData;
  } catch (error) {
    console.error("WhatsApp service error:", error.message);
    throw error;
  }
};

/**
 * OPTIONAL: Helper function to send payment reminder messages
 * Constructs a formatted payment reminder message
 * @param {String} studentName - Name of the student
 * @param {Number} amount - Payment amount
 * @param {String} dueDate - Payment due date (format: YYYY-MM-DD or readable format)
 * @param {String} phone - Student phone number
 * @returns {Object} API response from WhatsApp API
 * @throws {Error} If sending fails
 */
export const sendPaymentReminder = async (
  studentName,
  amount,
  dueDate,
  phone
) => {
  try {
    // Format the reminder message
    const reminderMessage = `
Hola ${studentName},

Te recordamos que tu pago por concepto de colegiatura está pendiente.

💰 Monto: $${amount}
📅 Fecha límite: ${dueDate}

Por favor realiza tu pago lo antes posible para evitar inconvenientes.

Gracias,
AdminBot
`.trim();

    // Send the message using the main service
    const result = await sendWhatsAppMessage(phone, reminderMessage);
    return result;
  } catch (error) {
    console.error("Error sending payment reminder:", error.message);
    throw error;
  }
};
