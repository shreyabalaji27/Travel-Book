const loginForm = document.getElementById("loginForm");
const errorBox = document.getElementById("error");

loginForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      // ✅ Save login state
      localStorage.setItem("auth", "true");
      localStorage.setItem("userEmail", email);

      alert("Login successful!");
      window.location.href = "index.html";
    } else {
      errorBox.textContent = data.message || "Login failed!";
      errorBox.style.display = "block";
    }
  } catch (err) {
    errorBox.textContent = "Server error. Please try again.";
    errorBox.style.display = "block";
  }
});

function togglePassword() {
  const passField = document.getElementById("password");
  passField.type = passField.type === "password" ? "text" : "password";
}
