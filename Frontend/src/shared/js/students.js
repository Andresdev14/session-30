// Get token from localStorage
const TOKEN = localStorage.getItem("school_token");
const API_URL = "http://localhost:3000";

// DOM Elements
const studentsBody = document.getElementById("studentsBody");
const studentForm = document.getElementById("studentForm");
const studentMessage = document.getElementById("studentMessage");

// Form inputs
const studentCode = document.getElementById("studentCode");
const studentFirstName = document.getElementById("studentFirstName");
const studentLastName = document.getElementById("studentLastName");
const studentDocumentType = document.getElementById("studentDocumentType");
const studentDocumentNumber = document.getElementById("studentDocumentNumber");
const studentBirthDate = document.getElementById("studentBirthDate");
const studentGrade = document.getElementById("studentGrade");
const studentSchoolYear = document.getElementById("studentSchoolYear");
const studentStatus = document.getElementById("studentStatus");

// Check authentication
if (!TOKEN) {
  window.location.href = "/src/pages/auth/login.html";
}

// API Helper
async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${TOKEN}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("school_token");
      window.location.href = "/src/pages/auth/login.html";
    }
    const error = await response.json();
    throw new Error(error.error || "Request failed");
  }

  return response.json();
}

// Show message
function showMessage(text, type = "success") {
  studentMessage.textContent = text;
  studentMessage.className = `message ${type}`;
  studentMessage.hidden = false;

  setTimeout(() => {
    studentMessage.hidden = true;
  }, 3000);
}

// Load students
async function loadStudents() {
  try {
    const result = await apiRequest("/students");
    const students = result.data || result;

    studentsBody.innerHTML = "";

    if (Array.isArray(students) && students.length > 0) {
      students.forEach((student) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${student.student_code || "-"}</td>
          <td>${student.first_name || "-"}</td>
          <td>${student.last_name || "-"}</td>
          <td>${student.document_number || "-"}</td>
          <td>${student.grade || "-"}</td>
          <td>${student.school_year || "-"}</td>
          <td><span class="badge ${student.status === "active" ? "success" : "danger"}">${student.status || "active"}</span></td>
          <td>
            <button class="action-btn edit-btn" data-id="${student.id}">Editar</button>
            <button class="action-btn delete-btn" data-id="${student.id}">Eliminar</button>
          </td>
        `;
        studentsBody.appendChild(row);
      });

      // Add event listeners to delete buttons
      document.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          deleteStudent(e.target.dataset.id);
        });
      });

      // Add event listeners to edit buttons
      document.querySelectorAll(".edit-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          editStudent(e.target.dataset.id);
        });
      });
    } else {
      studentsBody.innerHTML =
        '<tr><td colspan="8" style="text-align: center;">No hay estudiantes registrados</td></tr>';
    }
  } catch (error) {
    console.error("Error loading students:", error);
    showMessage("Error cargando estudiantes", "error");
  }
}

// Create student
async function createStudent(data) {
  try {
    const result = await apiRequest("/students", {
      method: "POST",
      body: JSON.stringify(data),
    });

    showMessage("Estudiante creado exitosamente");
    studentForm.reset();
    loadStudents();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

// Update student
async function updateStudent(id, data) {
  try {
    const result = await apiRequest(`/students/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });

    showMessage("Estudiante actualizado exitosamente");
    studentForm.reset();
    loadStudents();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

// Delete student
async function deleteStudent(id) {
  if (confirm("¿Estás seguro de que deseas eliminar este estudiante?")) {
    try {
      await apiRequest(`/students/${id}`, {
        method: "DELETE",
      });

      showMessage("Estudiante eliminado exitosamente");
      loadStudents();
    } catch (error) {
      showMessage(error.message, "error");
    }
  }
}

// Edit student
async function editStudent(id) {
  try {
    const result = await apiRequest(`/students/${id}`);
    const student = result.data || result;

    studentCode.value = student.student_code || "";
    studentFirstName.value = student.first_name || "";
    studentLastName.value = student.last_name || "";
    studentDocumentType.value = student.document_type || "";
    studentDocumentNumber.value = student.document_number || "";
    studentBirthDate.value = student.birth_date || "";
    studentGrade.value = student.grade || "";
    studentSchoolYear.value = student.school_year || "";
    studentStatus.value = student.status || "active";

    // Change form action to update
    studentForm.dataset.editId = id;
    studentForm.querySelector("button[type='submit']").textContent =
      "Actualizar estudiante";

    // Scroll to form
    studentForm.scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    showMessage(error.message, "error");
  }
}

// Form submit handler
studentForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    student_code: studentCode.value,
    first_name: studentFirstName.value,
    last_name: studentLastName.value,
    document_type: studentDocumentType.value || null,
    document_number: studentDocumentNumber.value || null,
    birth_date: studentBirthDate.value || null,
    grade: studentGrade.value || null,
    school_year: studentSchoolYear.value || null,
    status: studentStatus.value || "active",
  };

  if (studentForm.dataset.editId) {
    await updateStudent(studentForm.dataset.editId, data);
    delete studentForm.dataset.editId;
    studentForm.querySelector("button[type='submit']").textContent =
      "Guardar estudiante";
  } else {
    await createStudent(data);
  }
});

// Load students on page load
loadStudents();
const studentsBody = document.getElementById("studentsBody");
const studentForm = document.getElementById("studentForm");
const studentMessage = document.getElementById("studentMessage");

if (!STUDENTS_TOKEN) {
  window.location.href = "../auth/login.html";
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`http://localhost:3000${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STUDENTS_TOKEN}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("school_token");
      window.location.href = "../auth/login.html";
    }
    const errorResponse = await response.json().catch(() => ({}));
    throw new Error(errorResponse.message || "Error cargando estudiantes");
  }

  return response.json();
}

function renderStudents(students) {
  studentsBody.innerHTML = "";

  if (!Array.isArray(students) || students.length === 0) {
    studentsBody.innerHTML = '<tr><td colspan="7">No hay estudiantes registrados.</td></tr>';
    return;
  }

  students.forEach((student) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${student.student_code || "-"}</td>
      <td>${student.first_name || "-"}</td>
      <td>${student.last_name || "-"}</td>
      <td>${student.document_number || "-"}</td>
      <td>${student.grade || "-"}</td>
      <td>${student.school_year || "-"}</td>
      <td>${student.status || "-"}</td>
    `;
    studentsBody.appendChild(row);
  });
}

function showMessage(text) {
  studentMessage.textContent = text;
  studentMessage.hidden = false;
}

function clearMessage() {
  studentMessage.textContent = "";
  studentMessage.hidden = true;
}

async function loadStudents() {
  try {
    const students = await apiRequest("/students");
    renderStudents(students);
  } catch (error) {
    showMessage(error.message);
  }
}

studentForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage();

  const payload = {
    student_code: document.getElementById("studentCode").value.trim(),
    first_name: document.getElementById("studentFirstName").value.trim(),
    last_name: document.getElementById("studentLastName").value.trim(),
    document_type: document.getElementById("studentDocumentType").value.trim(),
    document_number: document.getElementById("studentDocumentNumber").value.trim(),
    birth_date: document.getElementById("studentBirthDate").value,
    grade: document.getElementById("studentGrade").value.trim(),
    school_year: document.getElementById("studentSchoolYear").value,
    status: document.getElementById("studentStatus").value,
  };

  try {
    await apiRequest("/students", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    showMessage("Estudiante registrado correctamente.");
    studentForm.reset();
    loadStudents();
  } catch (error) {
    showMessage(error.message);
  }
});

loadStudents();
