const API_URL = "http://localhost:3000/api";

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem("token") || localStorage.getItem("school_token");
  
  const response = await fetch(API_URL + endpoint, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` })
    },
    ...options
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error del servidor");
  }

  return data;
}