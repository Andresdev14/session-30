const loginForm = document.getElementById("loginForm");
const messageBox = document.getElementById("message");

function showMessage(text) {
  messageBox.textContent = text;
  messageBox.hidden = false;
}

function clearMessage() {
  messageBox.textContent = "";
  messageBox.hidden = true;
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearMessage();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const response = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.ok && data.token) {
      localStorage.setItem("school_token", data.token);
      window.location.href = "../dashboard/dashboard.html";
      return;
    }

    showMessage(data.message || "Credenciales incorrectas.");
  } catch (error) {
    showMessage("Error conectando al servidor.");
  }
});
