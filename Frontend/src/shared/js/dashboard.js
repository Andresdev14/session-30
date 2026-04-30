const DASHBOARD_TOKEN = localStorage.getItem("school_token");
const studentsCount = document.getElementById("studentsCount");
const guardiansCount = document.getElementById("guardiansCount");
const logoutBtn = document.getElementById("logoutBtn");

if (!DASHBOARD_TOKEN) {
  window.location.href = "../auth/login.html";
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`http://localhost:3000${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DASHBOARD_TOKEN}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("school_token");
      window.location.href = "../auth/login.html";
    }
    throw new Error("Error cargando datos");
  }

  return response.json();
}

async function loadMetrics() {
  try {
    const [students, guardians] = await Promise.all([
      apiRequest("/students"),
      apiRequest("/acudientes"),
    ]);

    studentsCount.textContent = Array.isArray(students) ? students.length : 0;
    guardiansCount.textContent = Array.isArray(guardians) ? guardians.length : 0;
  } catch (error) {
    console.error(error);
  }
}

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("school_token");
  window.location.href = "../auth/login.html";
});

loadMetrics();
