document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const loginStatus = document.getElementById("loginStatus");
  loginForm.addEventListener("submit", handleFormSubmit);

  const backendURL = "http://localhost:5500";

  async function handleFormSubmit(event) {
    event.preventDefault();
    const phoneNumber = document.getElementById("phoneNumber").value;
    const password = document.getElementById("password").value;

    const loginData = {
      phoneNumber: phoneNumber,
      password: password,
    };
    try {
      const response = await axios.post(
        `${backendURL}/users/login`,
        loginData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      alert("User logged in successfully");
      loginStatus.innerHTML = `<p>${response.data.message}</p>`;
      localStorage.setItem("token", response.data.token);
      loginForm.reset();
      window.location.href = "../views/chatWith.html";
    } catch (error) {
      alert("Invalid credentials");
      console.error(
        "Error during login:",
        error.response ? error.response.data.message : error.message
      );
      loginStatus.innerHTML = `<p>${
        error.response ? error.response.data.message : "Internal server error"
      }</p>`;
    }
  }
});
