const API_BASE_URL = "http://localhost:3000";
const TOKEN_KEY = "token";
const FALLBACK_TOKEN_KEY = "school_token";
const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem(FALLBACK_TOKEN_KEY);

const guardiansBody = document.getElementById("guardiansBody");
const guardianForm = document.getElementById("guardianForm");
const guardianMessage = document.getElementById("guardianMessage");
const guardiansStatus = document.getElementById("guardiansStatus");
const formTitle = document.getElementById("formTitle");
const formModeBadge = document.getElementById("formModeBadge");
const submitButton = document.getElementById("submitButton");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const guardianSearch = document.getElementById("guardianSearch");
const toastContainer = document.getElementById("toastContainer");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const confirmCancelBtn = document.getElementById("confirmCancelBtn");

const guardianFirstName = document.getElementById("guardianFirstName");
const guardianLastName = document.getElementById("guardianLastName");
const guardianPhone = document.getElementById("guardianPhone");
const guardianEmail = document.getElementById("guardianEmail");
const guardianAddress = document.getElementById("guardianAddress");
const guardianStudentsSelect = document.getElementById("guardianStudents");
const guardianWhatsappActive = document.getElementById("guardianWhatsappActive");

let currentEditId = null;
let guardiansCache = [];
let allStudents = [];
let pendingDeleteId = null;

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
  submitButton.disabled = isLoading;
  cancelEditBtn.disabled = isLoading;
  if (isLoading) {
    submitButton.textContent = currentEditId ? "Actualizando..." : "Guardando...";
  } else {
    submitButton.textContent = currentEditId ? "Actualizar acudiente" : "Guardar acudiente";
  }
}

function showMessage(message, type = "success") {
  guardianMessage.hidden = false;
  guardianMessage.textContent = message;
  guardianMessage.className = `message ${type}`;
}

function hideMessage() {
  guardianMessage.hidden = true;
  guardianMessage.textContent = "";
}

function showToast(message, type = "success") {
  if (!toastContainer) return;
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 4200);
}

function setTableStatus(text) {
  guardiansStatus.textContent = text;
}

function setFormMode(editId) {
  currentEditId = editId;
  if (editId) {
    formTitle.textContent = "Editar acudiente";
    formModeBadge.textContent = "Modo edición";
    formModeBadge.classList.add("info");
    formModeBadge.classList.remove("success");
    submitButton.textContent = "Actualizar acudiente";
    cancelEditBtn.hidden = false;
  } else {
    formTitle.textContent = "Registrar acudiente";
    formModeBadge.textContent = "Modo creación";
    formModeBadge.classList.remove("success");
    formModeBadge.classList.add("info");
    submitButton.textContent = "Guardar acudiente";
    cancelEditBtn.hidden = true;
  }
}

function resetForm() {
  guardianForm.reset();
  currentEditId = null;
  setFormMode(null);
  hideMessage();
}

function filterGuardians() {
  const query = guardianSearch?.value.trim().toLowerCase() || "";
  if (!query) return guardiansCache;

  return guardiansCache.filter((guardian) => {
    const name = `${guardian.first_name || ""} ${guardian.last_name || ""}`.toLowerCase();
    return (
      name.includes(query) ||
      (guardian.phone || "").toLowerCase().includes(query) ||
      (guardian.email || "").toLowerCase().includes(query)
    );
  });
}

function buildGuardianRow(guardian) {
  const assignedStudents = Array.isArray(guardian.students) && guardian.students.length
    ? guardian.students.map((student) => `${student.student_code || ""} ${student.first_name || ""} ${student.last_name || ""}`.trim()).join(", ")
    : "-";

  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${guardian.first_name || "-"}</td>
    <td>${guardian.last_name || "-"}</td>
    <td>${guardian.phone || "-"}</td>
    <td>${guardian.email || "-"}</td>
    <td>${guardian.address || "-"}</td>
    <td>${assignedStudents}</td>
    <td><span class="badge ${guardian.whatsapp_active ? "success" : "danger"}">${guardian.whatsapp_active ? "Activo" : "Inactivo"}</span></td>
    <td>
      <button type="button" class="action-btn edit-btn" data-id="${guardian.id}">Editar</button>
      <button type="button" class="action-btn delete-btn" data-id="${guardian.id}">Eliminar</button>
    </td>
  `;

  row.querySelector(".edit-btn").addEventListener("click", () => startEditGuardian(guardian.id));
  row.querySelector(".delete-btn").addEventListener("click", () => confirmDeleteGuardian(guardian.id, `${guardian.first_name || ""} ${guardian.last_name || ""}`));

  return row;
}

function renderGuardians(guardians) {
  guardiansBody.innerHTML = "";

  if (!Array.isArray(guardians) || guardians.length === 0) {
    const emptyRow = document.createElement("tr");
    emptyRow.innerHTML = `
      <td colspan="8" class="empty-state">
        No hay acudientes registrados. Utiliza el formulario para crear el primero.
      </td>
    `;
    guardiansBody.appendChild(emptyRow);
    setTableStatus("0 acudientes");
    return;
  }

  guardians.forEach((guardian) => {
    guardiansBody.appendChild(buildGuardianRow(guardian));
  });

  setTableStatus(`${guardians.length} acudiente${guardians.length === 1 ? "" : "s"}`);
}

function normalizeResponse(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
}

function populateStudentSelect() {
  if (!guardianStudentsSelect) return;
  guardianStudentsSelect.innerHTML = "";
  allStudents.forEach((student) => {
    const option = document.createElement("option");
    option.value = student.id;
    option.textContent = `${student.student_code || ""} ${student.first_name || ""} ${student.last_name || ""}`.trim();
    guardianStudentsSelect.appendChild(option);
  });
}

function setSelectedStudents(studentIds) {
  if (!guardianStudentsSelect) return;
  Array.from(guardianStudentsSelect.options).forEach((option) => {
    option.selected = studentIds.includes(option.value);
  });
}

function getSelectedStudentIds() {
  if (!guardianStudentsSelect) return [];
  return Array.from(guardianStudentsSelect.selectedOptions).map((option) => option.value);
}

async function loadGuardians() {
  try {
    setTableStatus("Cargando acudientes...");
    guardiansBody.innerHTML = `
      <tr><td colspan="8" class="empty-state">Cargando acudientes, por favor espera...</td></tr>
    `;
    const [guardiansResult, studentsResult] = await Promise.all([
      apiRequest("/guardians"),
      apiRequest("/students")
    ]);
    guardiansCache = normalizeResponse(guardiansResult);
    allStudents = normalizeResponse(studentsResult);
    populateStudentSelect();
    renderGuardians(filterGuardians());
  } catch (error) {
    guardiansBody.innerHTML = `
      <tr><td colspan="8" class="empty-state">${error.message || "Error al cargar los acudientes."}</td></tr>
    `;
    setTableStatus("Error de carga");
    showMessage(error.message, "error");
    showToast(error.message, "error");
  }
}

async function createGuardian(payload) {
  try {
    setLoading(true);
    await apiRequest("/guardians", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    showMessage("Acudiente creado correctamente.", "success");
    showToast("Acudiente creado correctamente.", "success");
    resetForm();
    await loadGuardians();
  } catch (error) {
    showMessage(error.message, "error");
    showToast(error.message, "error");
  } finally {
    setLoading(false);
  }
}

async function updateGuardian(id, payload) {
  try {
    setLoading(true);
    await apiRequest(`/guardians/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    showMessage("Acudiente actualizado correctamente.", "success");
    showToast("Acudiente actualizado correctamente.", "success");
    resetForm();
    await loadGuardians();
  } catch (error) {
    showMessage(error.message, "error");
    showToast(error.message, "error");
  } finally {
    setLoading(false);
  }
}

function closeConfirmModal() {
  const modal = document.getElementById("confirmModal");
  if (!modal) return;
  modal.classList.add("hidden");
  pendingDeleteId = null;
}

async function deleteGuardian(id) {
  try {
    setLoading(true);
    await apiRequest(`/guardians/${id}`, {
      method: "DELETE",
    });
    showMessage("Acudiente eliminado correctamente.", "success");
    showToast("Acudiente eliminado correctamente.", "success");
    await loadGuardians();
  } catch (error) {
    showMessage(error.message, "error");
    showToast(error.message, "error");
  } finally {
    setLoading(false);
    closeConfirmModal();
  }
}

function confirmDeleteGuardian(id, label = "el acudiente") {
  pendingDeleteId = id;
  const modal = document.getElementById("confirmModal");
  const modalMessage = document.getElementById("confirmModalMessage");
  if (!modal || !modalMessage) {
    deleteGuardian(id);
    return;
  }
  modalMessage.textContent = `¿Eliminar ${label.trim()}? Esta acción no se puede deshacer.`;
  modal.classList.remove("hidden");
}

function startEditGuardian(id) {
  const guardian = guardiansCache.find((item) => item.id === id);
  if (!guardian) {
    showMessage("No se encontró el acudiente para editar.", "error");
    showToast("No se encontró el acudiente para editar.", "error");
    return;
  }

  guardianFirstName.value = guardian.first_name || "";
  guardianLastName.value = guardian.last_name || "";
  guardianPhone.value = guardian.phone || "";
  guardianEmail.value = guardian.email || "";
  guardianAddress.value = guardian.address || "";
  guardianWhatsappActive.value = guardian.whatsapp_active ? "1" : "0";
  setSelectedStudents((guardian.students || []).map((student) => student.student_id));

  setFormMode(id);
  hideMessage();
  guardianFirstName.scrollIntoView({ behavior: "smooth", block: "center" });
}

guardianForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideMessage();

  const payload = {
    first_name: guardianFirstName.value.trim(),
    last_name: guardianLastName.value.trim(),
    phone: guardianPhone.value.trim(),
    email: guardianEmail.value.trim() || null,
    address: guardianAddress.value.trim() || null,
    whatsapp_active: guardianWhatsappActive.value === "1" ? 1 : 0,
    student_ids: getSelectedStudentIds()
  };

  if (!payload.first_name || !payload.last_name || !payload.phone) {
    showMessage("Por favor completa los campos obligatorios.", "error");
    showToast("Por favor completa los campos obligatorios.", "error");
    return;
  }

  if (currentEditId) {
    await updateGuardian(currentEditId, payload);
  } else {
    await createGuardian(payload);
  }
});

cancelEditBtn.addEventListener("click", () => {
  resetForm();
});

if (guardianSearch) {
  guardianSearch.addEventListener("input", () => renderGuardians(filterGuardians()));
}

if (confirmCancelBtn) {
  confirmCancelBtn.addEventListener("click", closeConfirmModal);
}

if (confirmDeleteBtn) {
  confirmDeleteBtn.addEventListener("click", () => {
    if (pendingDeleteId) {
      deleteGuardian(pendingDeleteId);
    }
  });
}

setFormMode(null);
loadGuardians();