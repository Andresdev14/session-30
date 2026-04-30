const PAYMENTS_TOKEN = localStorage.getItem("school_token");
const paymentsBody = document.getElementById("paymentsBody");
const paymentForm = document.getElementById("paymentForm");
const paymentMessage = document.getElementById("paymentMessage");

if (!PAYMENTS_TOKEN) {
  window.location.href = "../auth/login.html";
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`http://localhost:3000${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PAYMENTS_TOKEN}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("school_token");
      window.location.href = "../auth/login.html";
    }
    const errorResponse = await response.json().catch(() => ({}));
    throw new Error(errorResponse.message || "Error cargando pagos");
  }

  return response.json();
}

function renderPayments(payments) {
  paymentsBody.innerHTML = "";

  if (!Array.isArray(payments) || payments.length === 0) {
    paymentsBody.innerHTML = '<tr><td colspan="6">No hay pagos registrados.</td></tr>';
    return;
  }

  payments.forEach((payment) => {
    const studentLabel = payment.student_name || payment.studentId || payment.student_id || "-";
    const dateLabel = payment.payment_date || payment.created_at || payment.date || "-";
    const amountLabel = payment.amount_paid || payment.amount || "-";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${payment.id || "-"}</td>
      <td>${studentLabel}</td>
      <td>${amountLabel}</td>
      <td>${payment.payment_method || payment.method || "-"}</td>
      <td>${payment.reference || "-"}</td>
      <td>${dateLabel}</td>
    `;
    paymentsBody.appendChild(row);
  });
}

function showMessage(text) {
  paymentMessage.textContent = text;
  paymentMessage.hidden = false;
}

function clearMessage() {
  paymentMessage.textContent = "";
  paymentMessage.hidden = true;
}

async function loadPayments() {
  try {
    const payments = await apiRequest("/pagos");
    renderPayments(payments);
  } catch (error) {
    showMessage(error.message);
  }
}

paymentForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage();

  const payload = {
    student_id: document.getElementById("paymentStudentId").value.trim(),
    amount: parseFloat(document.getElementById("paymentAmount").value),
    payment_method: document.getElementById("paymentMethod").value.trim(),
    reference: document.getElementById("paymentReference").value.trim(),
  };

  try {
    await apiRequest("/pagos", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    showMessage("Pago registrado correctamente.");
    paymentForm.reset();
    loadPayments();
  } catch (error) {
    showMessage(error.message);
  }
});

loadPayments();
