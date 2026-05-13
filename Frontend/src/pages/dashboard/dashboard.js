const TOKEN_KEY = "token";
const FALLBACK_TOKEN_KEY = "school_token";
const API_URL = "http://localhost:3000";

const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem(FALLBACK_TOKEN_KEY);
const studentsCount = document.getElementById("studentsCount");
const guardiansCount = document.getElementById("guardiansCount");
const paymentsCount = document.getElementById("paymentsCount");
const pendingCount = document.getElementById("pendingCount");
const recentStudentsBody = document.getElementById("recentStudentsBody");
const recentPaymentsBody = document.getElementById("recentPaymentsBody");
const dashboardMessage = document.getElementById("dashboardMessage");
const logoutBtn = document.getElementById("logoutBtn");

if (!token) {
  redirectToLogin();
}

function redirectToLogin() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(FALLBACK_TOKEN_KEY);
  window.location.href = "../auth/login.html";
}

function formatCurrency(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function showMessage(message, type = "error") {
  dashboardMessage.hidden = false;
  dashboardMessage.textContent = message;
  dashboardMessage.style.borderColor = type === "error" ? "rgba(255, 118, 138, 0.4)" : "rgba(93, 140, 255, 0.4)";
  dashboardMessage.style.backgroundColor = type === "error" ? "rgba(255, 118, 138, 0.15)" : "rgba(93, 140, 255, 0.12)";
}

function hideMessage() {
  dashboardMessage.hidden = true;
}

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      redirectToLogin();
    }
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || payload.message || "Error al cargar datos");
  }

  return response.json();
}

function renderMetrics(data) {
  studentsCount.textContent = data.total_students ?? 0;
  guardiansCount.textContent = data.total_guardians ?? 0;
  paymentsCount.textContent = data.total_payments ?? 0;
  pendingCount.textContent = data.pending_accounts ?? 0;
}

function renderRecentStudents(students) {
  recentStudentsBody.innerHTML = "";

  if (!Array.isArray(students) || students.length === 0) {
    recentStudentsBody.innerHTML = `
      <tr><td colspan="2" class="empty-state">No se encontraron estudiantes recientes.</td></tr>
    `;
    return;
  }

  students.forEach((student) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${student.first_name || ""} ${student.last_name || ""}</td>
      <td>${formatDate(student.created_at)}</td>
    `;
    recentStudentsBody.appendChild(row);
  });
}

function renderRecentPayments(payments) {
  recentPaymentsBody.innerHTML = "";

  if (!Array.isArray(payments) || payments.length === 0) {
    recentPaymentsBody.innerHTML = `
      <tr><td colspan="3" class="empty-state">No se encontraron pagos recientes.</td></tr>
    `;
    return;
  }

  payments.forEach((payment) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${formatCurrency(payment.amount_paid)}</td>
      <td>${payment.payment_method || "-"}</td>
      <td>${formatDate(payment.payment_date)}</td>
    `;
    recentPaymentsBody.appendChild(row);
  });
}

async function loadDashboard() {
  try {
    hideMessage();
    recentStudentsBody.innerHTML = `<tr><td colspan="2" class="empty-state">Cargando estudiantes...</td></tr>`;
    recentPaymentsBody.innerHTML = `<tr><td colspan="3" class="empty-state">Cargando pagos...</td></tr>`;

    const result = await apiRequest("/dashboard");
    const data = result.data || {};

    renderMetrics(data);
    renderRecentStudents(data.recent_students);
    renderRecentPayments(data.recent_payments);
  } catch (error) {
    showMessage(error.message || "No se pudo cargar el panel.");
  }
}

logoutBtn.addEventListener("click", () => {
  redirectToLogin();
});

loadDashboard();