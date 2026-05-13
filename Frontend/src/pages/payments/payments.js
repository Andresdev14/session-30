const API_BASE_URL = "http://localhost:3000";
const TOKEN_KEY = "token";
const FALLBACK_TOKEN_KEY = "school_token";
const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem(FALLBACK_TOKEN_KEY);

const paymentsBody = document.getElementById("paymentsBody");
const paymentForm = document.getElementById("paymentForm");
const paymentMessage = document.getElementById("paymentMessage");
const paymentAccountId = document.getElementById("paymentAccountId");
const paymentAmount = document.getElementById("paymentAmount");
const paymentMethod = document.getElementById("paymentMethod");
const paymentReference = document.getElementById("paymentReference");
const paymentsTotal = document.getElementById("paymentsTotal");
const pendingTotal = document.getElementById("pendingTotal");

let accountsCache = [];

function redirectToLogin() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(FALLBACK_TOKEN_KEY);
  window.location.href = "../auth/login.html";
}

if (!token) {
  redirectToLogin();
}

function getPayload(response) {
  return response.json().catch(() => ({}));
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

  if (!response.ok) {
    if (response.status === 401) {
      redirectToLogin();
    }

    const payload = await getPayload(response);
    throw new Error(payload.error || payload.message || "Error del servidor");
  }

  return response.json();
}

function setLoading(isLoading) {
  const submitButton = paymentForm.querySelector('button[type="submit"]');
  submitButton.disabled = isLoading;
  if (isLoading) {
    submitButton.textContent = "Guardando...";
  } else {
    submitButton.textContent = "Guardar pago";
  }
}

function showMessage(message, type = "success") {
  paymentMessage.hidden = false;
  paymentMessage.textContent = message;
  paymentMessage.className = `message ${type}`;
}

function hideMessage() {
  paymentMessage.hidden = true;
  paymentMessage.textContent = "";
}

function buildPaymentRow(payment) {
  const studentName = `${payment.first_name || ""} ${payment.last_name || ""}`.trim() || "-";
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${studentName}</td>
    <td>${payment.amount_paid || "-"}</td>
    <td>${payment.payment_method || "-"}</td>
    <td>${payment.reference || "-"}</td>
    <td>${payment.payment_date || "-"}</td>
    <td>
      <button type="button" class="action-btn delete-btn" data-id="${payment.id}">Eliminar</button>
    </td>
  `;

  row.querySelector(".delete-btn").addEventListener("click", () => confirmDeletePayment(payment.id));

  return row;
}

function renderPayments(payments) {
  paymentsBody.innerHTML = "";

  if (!Array.isArray(payments) || payments.length === 0) {
    const emptyRow = document.createElement("tr");
    emptyRow.innerHTML = `
      <td colspan="6" class="empty-state">
        No hay pagos registrados. Utiliza el formulario para crear el primero.
      </td>
    `;
    paymentsBody.appendChild(emptyRow);
    return;
  }

  payments.forEach((payment) => {
    paymentsBody.appendChild(buildPaymentRow(payment));
  });
}

function populateAccountSelect(accounts) {
  paymentAccountId.innerHTML = '<option value="">Selecciona una cuenta</option>';
  accounts.forEach((account) => {
    const option = document.createElement("option");
    option.value = account.id;
    option.textContent = `${account.first_name} ${account.last_name} - ${account.charge_type_name} - Saldo: ${account.outstanding_balance}`;
    paymentAccountId.appendChild(option);
  });
}

async function loadPayments() {
  try {
    const result = await apiRequest("/payments");
    const payments = Array.isArray(result.data) ? result.data : result || [];
    renderPayments(payments);
  } catch (error) {
    paymentsBody.innerHTML = `
      <tr><td colspan="6" class="empty-state">${error.message || "Error al cargar los pagos."}</td></tr>
    `;
    showMessage(error.message, "error");
  }
}

async function loadAccounts() {
  try {
    const result = await apiRequest("/accounts/pending");
    accountsCache = Array.isArray(result.data) ? result.data : result || [];
    populateAccountSelect(accountsCache);
  } catch (error) {
    showMessage("Error al cargar cuentas pendientes: " + error.message, "error");
  }
}

function renderSummary(data) {
  paymentsTotal.textContent = data.total_payments ?? 0;
  pendingTotal.textContent = data.pending_accounts ?? 0;
}

async function loadDashboardSummary() {
  try {
    const result = await apiRequest("/dashboard");
    renderSummary(result.data || {});
  } catch (error) {
    showMessage("No se pudo cargar el resumen de pagos.", "error");
  }
}

async function createPayment(payload) {
  try {
    setLoading(true);
    await apiRequest("/payments", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    showMessage("Pago registrado correctamente.", "success");
    paymentForm.reset();
    await loadPayments();
    await loadAccounts(); // Reload accounts in case balances changed
    await loadDashboardSummary();
  } catch (error) {
    showMessage(error.message, "error");
  } finally {
    setLoading(false);
  }
}

async function confirmDeletePayment(id) {
  const confirmation = window.confirm("¿Estás seguro de que deseas eliminar este pago?");
  if (!confirmation) return;

  try {
    setLoading(true);
    await apiRequest(`/payments/${id}`, {
      method: "DELETE",
    });
    showMessage("Pago eliminado correctamente.", "success");
    await loadPayments();
    await loadAccounts();
    await loadDashboardSummary();
  } catch (error) {
    showMessage(error.message, "error");
  } finally {
    setLoading(false);
  }
}

paymentForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideMessage();

  const accountId = paymentAccountId.value;
  const amount = parseFloat(paymentAmount.value);
  const method = paymentMethod.value;
  const reference = paymentReference.value.trim();

  if (!accountId || !amount || !method) {
    showMessage("Por favor completa los campos obligatorios.", "error");
    return;
  }

  if (amount <= 0) {
    showMessage("El monto debe ser mayor a cero.", "error");
    return;
  }

  const payload = {
    account_receivable_id: accountId,
    payment_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    amount_paid: amount,
    payment_method: method,
    reference: reference || null,
  };

  await createPayment(payload);
});

loadPayments();
loadAccounts();
loadDashboardSummary();