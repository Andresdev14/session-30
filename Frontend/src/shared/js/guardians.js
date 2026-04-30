const GUARDIANS_TOKEN = localStorage.getItem("school_token");
const guardiansBody = document.getElementById("guardiansBody");
const guardianForm = document.getElementById("guardianForm");
const guardianMessage = document.getElementById("guardianMessage");

if (!GUARDIANS_TOKEN) {
  window.location.href = "../auth/login.html";
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`http://localhost:3000${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GUARDIANS_TOKEN}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("school_token");
      window.location.href = "../auth/login.html";
    }
    const errorResponse = await response.json().catch(() => ({}));
    throw new Error(errorResponse.message || "Error cargando acudientes");
  }

  return response.json();
}

function renderGuardians(guardians) {
  guardiansBody.innerHTML = "";

  if (!Array.isArray(guardians) || guardians.length === 0) {
    guardiansBody.innerHTML = '<tr><td colspan="5">No hay acudientes registrados.</td></tr>';
    return;
  }

  guardians.forEach((guardian) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${guardian.first_name || guardian.nombres || "-"}</td>
      <td>${guardian.last_name || guardian.apellidos || "-"}</td>
      <td>${guardian.phone || guardian.telefono || "-"}</td>
      <td>${guardian.email || guardian.correo || "-"}</td>
      <td>${guardian.address || guardian.direccion || "-"}</td>
    `;
    guardiansBody.appendChild(row);
  });
}

function showMessage(text) {
  guardianMessage.textContent = text;
  guardianMessage.hidden = false;
}

function clearMessage() {
  guardianMessage.textContent = "";
  guardianMessage.hidden = true;
}

async function loadGuardians() {
  try {
    const guardians = await apiRequest("/acudientes");
    renderGuardians(guardians);
  } catch (error) {
    showMessage(error.message);
  }
}

guardianForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage();

  const payload = {
    first_name: document.getElementById("guardianFirstName").value.trim(),
    last_name: document.getElementById("guardianLastName").value.trim(),
    phone: document.getElementById("guardianPhone").value.trim(),
    email: document.getElementById("guardianEmail").value.trim(),
    address: document.getElementById("guardianAddress").value.trim(),
  };

  try {
    await apiRequest("/acudientes", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    showMessage("Acudiente registrado correctamente.");
    guardianForm.reset();
    loadGuardians();
  } catch (error) {
    showMessage(error.message);
  }
});

loadGuardians();
