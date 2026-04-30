const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "../auth/login.html";
}

async function loadData() {
  const res = await fetch("http://localhost:3000/students", {
    headers: {
      "Authorization": "Bearer " + token
    }
  });

  const data = await res.json();

  document.getElementById("data").innerText =
    JSON.stringify(data, null, 2);
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "../auth/login.html";
}

loadData();