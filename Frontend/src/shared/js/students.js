const STUDENTS_TOKEN = localStorage.getItem("school_token");
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
