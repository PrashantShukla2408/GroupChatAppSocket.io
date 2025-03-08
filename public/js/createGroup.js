document.addEventListener("DOMContentLoaded", async () => {
  const usersContainer = document.getElementById("usersContainer");
  const groupForm = document.getElementById("groupForm");
  const token = localStorage.getItem("token");

  const backendURL = "http://localhost:5500";

  try {
    const response = await axios.get(`${backendURL}/users/allUsers`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const users = response.data.users;

    users.forEach((user) => {
      const userElement = document.createElement("div");
      userElement.innerHTML = `
                <input type="checkbox" id="user_${user.id}" name="users" value="${user.id}">
                <label for="user_${user.id}">${user.name}</label>
            `;
      usersContainer.appendChild(userElement);
    });
  } catch (error) {
    console.log("Error fetching users: ", error);
  }

  groupForm.addEventListener("submit", handleFormSubmit);

  async function handleFormSubmit(event) {
    event.preventDefault();
    const groupName = document.getElementById("groupName").value;
    const selectedUsers = Array.from(
      document.querySelectorAll('input[name="users"]:checked')
    ).map((checkbox) => checkbox.value);

    console.log(selectedUsers);

    const groupData = {
      groupName: groupName,
      selectedUsers: selectedUsers,
    };

    try {
      const response = await axios.post(
        `${backendURL}/groups/create`,
        groupData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data);
      alert("Group created successfully");
      window.location.href = "../views/groupChatWindow.html";
    } catch (error) {
      console.log("Error creating group: ", error);
    }
  }
});
