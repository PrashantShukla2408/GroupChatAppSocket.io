document.addEventListener("DOMContentLoaded", () => {
  const backendURL = "http://localhost:5500";

  const signUpForm = document.getElementById("signUpForm");
  const signUpStatus = document.getElementById("signUpStatus");

  signUpForm.addEventListener("submit", handleFormSubmit);

  async function handleFormSubmit(event) {
    event.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phoneNumber = document.getElementById("phoneNumber").value;
    const password = document.getElementById("password").value;

    const userData = {
      name: name,
      email: email,
      phoneNumber: phoneNumber,
      password: password,
    };

    try {
      const response = await axios.post(
        `${backendURL}/users/signup`,
        userData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response.data);
      alert("User signed up successfully");
      signUpStatus.innerHTML = `<p>${response.data.message}</p>`;
      signUpForm.reset();
    } catch (error) {
      console.error(
        "Error during signup: ",
        error.response ? error.response.data.message : error.message
      );
      signUpStatus.innerHTML = `<p>${
        error.response ? error.response.data.message : "Internal server error"
      }</p>`;
    }
  }
});
