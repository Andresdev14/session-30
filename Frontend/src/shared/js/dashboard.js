// Get token from localStorage
const TOKEN = localStorage.getItem("school_token");
const API_URL = "http://localhost:3000";

// DOM Elements
const studentsCount = document.getElementById("studentsCount");
const guardiansCount = document.getElementById("guardiansCount");
const paymentsCount = document.getElementById("paymentsCount");
const pendingCount = document.getElementById("pendingCount");
const logoutBtn = document.getElementById("logoutBtn");

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
    throw new Error("Error cargando datos");
  }

  return response.json();
}

// Load dashboard metrics
async function loadMetrics() {
  try {
    const result = await apiRequest("/dashboard");
    const stats = result.data?.stats || result.stats || {};

    studentsCount.textContent = stats.totalStudents || 0;
    guardiansCount.textContent = stats.totalGuardians || 0;
    paymentsCount.textContent = stats.recentPayments?.count || stats.totalPayments || 0;
    pendingCount.textContent = stats.totalPendingAccounts || 0;
  } catch (error) {
    console.error("Error loading metrics:", error);
    studentsCount.textContent = "0";
    guardiansCount.textContent = "0";
    paymentsCount.textContent = "0";
    pendingCount.textContent = "0";
  }
}

// Logout handler
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("school_token");
  window.location.href = "/src/pages/auth/login.html";
});

// Load metrics on page load
loadMetrics();
