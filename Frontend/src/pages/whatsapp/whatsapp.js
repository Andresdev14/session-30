const API_BASE_URL = "http://localhost:3000";
const TOKEN_KEY = "token";
const FALLBACK_TOKEN_KEY = "school_token";
const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem(FALLBACK_TOKEN_KEY);

const whatsappForm = document.getElementById("whatsappForm");
const whatsappPhone = document.getElementById("whatsappPhone");
const whatsappText = document.getElementById("whatsappText");
const whatsappMessage = document.getElementById("whatsappMessage");
const submitButton = document.getElementById("submitButton");
const toastContainer = document.getElementById("toastContainer");

function redirectToLogin() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(FALLBACK_TOKEN_KEY);
  window.location.href = "../auth/login.html";
}

if (!token) {
  redirectToLogin();
}

function showMessage(text, type = "success") {
  whatsappMessage.hidden = false;
  whatsappMessage.textContent = text;
  whatsappMessage.className = `message ${type}`;
}

function hideMessage() {
  whatsappMessage.hidden = true;
  whatsappMessage.textContent = "";
}

function showToast(message, type = "success") {
  if (!toastContainer) return;
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 4200);
}

function setLoading(isLoading) {
  submitButton.disabled = isLoading;
  submitButton.textContent = isLoading ? "Enviando..." : "Enviar mensaje";
}

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      redirectToLogin();
    }
    throw new Error(data.error || data.message || "Error del servidor");
  }

  return data;
}

whatsappForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideMessage();

  const phone = whatsappPhone.value.trim();
  const message = whatsappText.value.trim();

  if (!phone || !message) {
    showMessage("Completa el teléfono y el mensaje antes de enviar.", "error");
    showToast("Completa el teléfono y el mensaje.", "error");
    return;
  }

  if (!/^[0-9]{10,15}$/.test(phone)) {
    showMessage("El teléfono debe tener entre 10 y 15 dígitos numéricos.", "error");
    showToast("Teléfono inválido.", "error");
    return;
  }

  try {
    setLoading(true);
    const result = await apiRequest("/whatsapp/send", {
      method: "POST",
      body: JSON.stringify({ phone, message }),
    });

    showMessage(result.message || "Mensaje enviado correctamente.", "success");
    showToast("Mensaje enviado correctamente.", "success");
    whatsappForm.reset();
  } catch (error) {
    showMessage(error.message, "error");
    showToast(error.message, "error");
  } finally {
    setLoading(false);
  }
});
