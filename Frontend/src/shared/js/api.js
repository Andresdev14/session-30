const API_URL = "http://localhost:3000/api";

export async function request(endpoint, options = {}) {
  const response = await fetch(API_URL + endpoint, {
    headers: {
      "Content-Type": "application/json"
    },
    ...options
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error del servidor");
  }

  return data;
}