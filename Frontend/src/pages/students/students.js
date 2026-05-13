const API_BASE_URL = "http://localhost:3000";
const TOKEN_KEY = "token";
const FALLBACK_TOKEN_KEY = "school_token";
const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem(FALLBACK_TOKEN_KEY);

const studentsBody = document.getElementById("studentsBody");
const studentForm = document.getElementById("studentForm");
const studentMessage = document.getElementById("studentMessage");
const studentsStatus = document.getElementById("studentsStatus");
const formTitle = document.getElementById("formTitle");
const formModeBadge = document.getElementById("formModeBadge");
const submitButton = document.getElementById("submitButton");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const studentSearch = document.getElementById("studentSearch");
const toastContainer = document.getElementById("toastContainer");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const confirmCancelBtn = document.getElementById("confirmCancelBtn");

const studentCode = document.getElementById("studentCode");
const studentFirstName = document.getElementById("studentFirstName");
const studentLastName = document.getElementById("studentLastName");
const studentDocumentType = document.getElementById("studentDocumentType");
const studentDocumentNumber = document.getElementById("studentDocumentNumber");
const studentBirthDate = document.getElementById("studentBirthDate");
const studentGrade = document.getElementById("studentGrade");
const studentSchoolYear = document.getElementById("studentSchoolYear");
const studentStatus = document.getElementById("studentStatus");
const studentGuardiansSelect = document.getElementById("studentGuardians");

let currentEditId = null;
let allGuardians = [];
let studentsCache = [];
let studentsRelations = [];
let guardianByStudent = {};
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
    submitButton.textContent = currentEditId ? "Actualizar estudiante" : "Guardar estudiante";
  }
}

function showMessage(message, type = "success") {
  studentMessage.hidden = false;
  studentMessage.textContent = message;
  studentMessage.className = `message ${type}`;
}

function hideMessage() {
  studentMessage.hidden = true;
  studentMessage.textContent = "";
}

function showToast(message, type = "success") {
  if (!toastContainer) return;
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 4200);
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

function setTableStatus(text) {
  studentsStatus.textContent = text;
}

function setFormMode(editId) {
  currentEditId = editId;
  if (editId) {
    formTitle.textContent = "Editar estudiante";
    formModeBadge.textContent = "Modo edición";
    formModeBadge.classList.add("info");
    formModeBadge.classList.remove("success");
    submitButton.textContent = "Actualizar estudiante";
    cancelEditBtn.hidden = false;
  } else {
    formTitle.textContent = "Registrar estudiante";
    formModeBadge.textContent = "Modo creación";
    formModeBadge.classList.remove("success");
    formModeBadge.classList.add("info");
    submitButton.textContent = "Guardar estudiante";
    cancelEditBtn.hidden = true;
  }
}

function resetForm() {
  studentForm.reset();
  currentEditId = null;
  setFormMode(null);
  hideMessage();
}

function updateGuardianMap() {
  guardianByStudent = studentsRelations.reduce((map, relation) => {
    const list = map[relation.student_id] || [];
    list.push(relation);
    map[relation.student_id] = list;
    return map;
  }, {});
}

function filterStudents() {
  const query = studentSearch?.value.trim().toLowerCase() || "";
  if (!query) return studentsCache;

  return studentsCache.filter((student) => {
    const studentCode = (student.student_code || "").toLowerCase();
    const firstName = (student.first_name || "").toLowerCase();
    const lastName = (student.last_name || "").toLowerCase();
    const fullName = `${firstName} ${lastName}`;
    return (
      studentCode.includes(query) ||
      firstName.includes(query) ||
      lastName.includes(query) ||
      fullName.includes(query)
    );
  });
}

function buildStudentRow(student) {
  const relations = guardianByStudent[student.id] || [];
  const guardianNames = relations.length
    ? relations
        .map((relation) => {
          const firstName = relation.first_name || relation.guardian_first_name || "";
          const lastName = relation.last_name || relation.guardian_last_name || "";
          const fullName = `${firstName} ${lastName}`.trim() || "-";
          const primaryLabel = relation.is_primary == 1 ? " (Primary)" : "";
          return `${fullName}${primaryLabel}`;
        })
        .join(", ")
    : "-";
  const guardianPhones = relations.length
    ? relations.map((relation) => relation.phone || relation.guardian_phone || "-").join(", ")
    : "-";

  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${student.student_code || "-"}</td>
    <td>${student.first_name || "-"}</td>
    <td>${student.last_name || "-"}</td>
    <td>${student.document_type ? `${student.document_type} ` : ""}${student.document_number || "-"}</td>
    <td>${student.grade || "-"}</td>
    <td>${student.school_year || "-"}</td>
    <td>${guardianNames}</td>
    <td>${guardianPhones}</td>
    <td><span class="badge ${student.status === "active" ? "success" : "danger"}">${student.status || "inactivo"}</span></td>
    <td>
      <button type="button" class="action-btn edit-btn" data-id="${student.id}">Editar</button>
      <button type="button" class="action-btn delete-btn" data-id="${student.id}">Eliminar</button>
    </td>
  `;

  row.querySelector(".edit-btn").addEventListener("click", () => startEditStudent(student.id));
  row.querySelector(".delete-btn").addEventListener("click", () => confirmDeleteStudent(student.id, `${student.student_code || student.first_name} ${student.last_name || ""}`));

  return row;
}

function renderStudents(students) {
  studentsBody.innerHTML = "";

  if (!Array.isArray(students) || students.length === 0) {
    const emptyRow = document.createElement("tr");
    emptyRow.innerHTML = `
      <td colspan="10" class="empty-state">
        No hay estudiantes registrados. Utiliza el formulario para crear el primero.
      </td>
    `;
    studentsBody.appendChild(emptyRow);
    setTableStatus("0 estudiantes");
    return;
  }

  students.forEach((student) => {
    studentsBody.appendChild(buildStudentRow(student));
  });

  setTableStatus(`${students.length} estudiante${students.length === 1 ? "" : "s"}`);
}

function normalizeResponse(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
}

function populateGuardianSelect() {
  if (!studentGuardiansSelect) return;
  studentGuardiansSelect.innerHTML = "";
  allGuardians.forEach((guardian) => {
    const option = document.createElement("option");
    option.value = guardian.id;
    option.textContent = `${guardian.first_name || ""} ${guardian.last_name || ""}`.trim();
    studentGuardiansSelect.appendChild(option);
  });
}

function setSelectedGuardians(guardianIds) {
  if (!studentGuardiansSelect) return;
  Array.from(studentGuardiansSelect.options).forEach((option) => {
    option.selected = guardianIds.includes(option.value);
  });
}

function getSelectedGuardianIds() {
  if (!studentGuardiansSelect) return [];
  return Array.from(studentGuardiansSelect.selectedOptions).map((option) => option.value);
}

async function loadStudents() {
  try {
    setTableStatus("Cargando estudiantes...");
    studentsBody.innerHTML = `
      <tr><td colspan="10" class="empty-state">Cargando estudiantes, por favor espera...</td></tr>
    `;

    const [studentsResponse, relationsResponse, guardiansResponse] = await Promise.all([
      apiRequest("/students"),
      apiRequest("/student-guardians"),
      apiRequest("/guardians")
    ]);

    studentsCache = normalizeResponse(studentsResponse);
    studentsRelations = normalizeResponse(relationsResponse);
    allGuardians = normalizeResponse(guardiansResponse);
    updateGuardianMap();
    populateGuardianSelect();
    renderStudents(filterStudents());
  } catch (error) {
    studentsBody.innerHTML = `
      <tr><td colspan="10" class="empty-state">${error.message || "Error al cargar los estudiantes."}</td></tr>
    `;
    setTableStatus("Error de carga");
    showMessage(error.message, "error");
    showToast(error.message, "error");
  }
}

async function createStudent(payload) {
  try {
    setLoading(true);
    await apiRequest("/students", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    showMessage("Estudiante creado correctamente.", "success");
    showToast("Estudiante creado correctamente.", "success");
    resetForm();
    await loadStudents();
  } catch (error) {
    showMessage(error.message, "error");
    showToast(error.message, "error");
  } finally {
    setLoading(false);
  }
}

async function updateStudent(id, payload) {
  try {
    setLoading(true);
    await apiRequest(`/students/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    showMessage("Estudiante actualizado correctamente.", "success");
    showToast("Estudiante actualizado correctamente.", "success");
    resetForm();
    await loadStudents();
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

async function deleteStudent(id) {
  try {
    setLoading(true);
    await apiRequest(`/students/${id}`, {
      method: "DELETE",
    });
    showMessage("Estudiante eliminado correctamente.", "success");
    showToast("Estudiante eliminado correctamente.", "success");
    await loadStudents();
  } catch (error) {
    const message = error.message.includes("Cannot delete")
      ? "No se puede eliminar este estudiante porque tiene datos relacionados. Revisa las cuentas o la asistencia antes de intentar nuevamente."
      : error.message;
    showMessage(message, "error");
    showToast(message, "error");
  } finally {
    setLoading(false);
    closeConfirmModal();
  }
}

function confirmDeleteStudent(id, label = "el estudiante") {
  pendingDeleteId = id;
  const modal = document.getElementById("confirmModal");
  const modalMessage = document.getElementById("confirmModalMessage");
  if (!modal || !modalMessage) {
    deleteStudent(id);
    return;
  }
  modalMessage.textContent = `¿Eliminar ${label.trim()}? Esta acción no se puede deshacer.`;
  modal.classList.remove("hidden");
}

function startEditStudent(id) {
  const student = studentsCache.find((item) => item.id === id);
  if (!student) {
    showMessage("No se encontró el estudiante para editar.", "error");
    showToast("No se encontró el estudiante para editar.", "error");
    return;
  }

  studentCode.value = student.student_code || "";
  studentFirstName.value = student.first_name || "";
  studentLastName.value = student.last_name || "";
  studentDocumentType.value = student.document_type || "";
  studentDocumentNumber.value = student.document_number || "";
  studentBirthDate.value = student.birth_date ? student.birth_date.split("T")[0] : "";
  studentGrade.value = student.grade || "";
  studentSchoolYear.value = student.school_year || "";
  studentStatus.value = student.status || "active";
  const selectedGuardianIds = (student.guardians || []).map((guardian) => guardian.guardian_id);
  if (selectedGuardianIds.length === 0 && guardianByStudent[student.id]) {
    selectedGuardianIds.push(...guardianByStudent[student.id].map((relation) => relation.guardian_id));
  }
  setSelectedGuardians(selectedGuardianIds);

  setFormMode(id);
  hideMessage();
  studentCode.scrollIntoView({ behavior: "smooth", block: "center" });
}

studentForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideMessage();

  const payload = {
    student_code: studentCode.value.trim(),
    first_name: studentFirstName.value.trim(),
    last_name: studentLastName.value.trim(),
    document_type: studentDocumentType.value.trim() || null,
    document_number: studentDocumentNumber.value.trim() || null,
    birth_date: studentBirthDate.value || null,
    grade: studentGrade.value.trim() || null,
    school_year: studentSchoolYear.value ? Number(studentSchoolYear.value) : null,
    status: studentStatus.value,    guardian_ids: getSelectedGuardianIds()  };

  if (!payload.student_code || !payload.first_name || !payload.last_name) {
    showMessage("Por favor completa los campos obligatorios.", "error");
    showToast("Por favor completa los campos obligatorios.", "error");
    return;
  }

  if (currentEditId) {
    await updateStudent(currentEditId, payload);
  } else {
    await createStudent(payload);
  }
});

cancelEditBtn.addEventListener("click", () => {
  resetForm();
});

if (studentSearch) {
  studentSearch.addEventListener("input", () => renderStudents(filterStudents()));
}

if (confirmCancelBtn) {
  confirmCancelBtn.addEventListener("click", closeConfirmModal);
}

if (confirmDeleteBtn) {
  confirmDeleteBtn.addEventListener("click", () => {
    if (pendingDeleteId) {
      deleteStudent(pendingDeleteId);
    }
  });
}

setFormMode(null);
loadStudents();
