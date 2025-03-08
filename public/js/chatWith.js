document.addEventListener("DOMContentLoaded", async () => {
  const usersContainer = document.getElementById("usersContainer");
  const logoutButton = document.getElementById("logoutButton");

  logoutButton.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "../views/login.html";
  });

  const backendURL = "http://localhost:5500";

  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${backendURL}/users/allUsers`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const users = response.data.users;
    users.forEach(async (user) => {
      const userElement = document.createElement("a");
      userElement.classList.add("user-card");
      userElement.href = `../views/chatWindow.html?chatWithId=${user.id}`;
      userElement.innerHTML = `
                ${user.name}
            `;
      const userGroupsContainer = document.createElement("div");
      userGroupsContainer.classList.add("user-groups");
      userGroupsContainer.innerHTML = "Groups:";
      const response = await axios.get(
        `${backendURL}/groups/userGroups/${user.id}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const userGroups = response.data.userGroups;
      userGroups.forEach((group) => {
        const groupElement = document.createElement("div");
        groupElement.innerHTML = `
            <a href="../views/groupChatWindow.html?groupId=${group.id}&groupName=${group.groupName}">${group.groupName}</a>
        `;
        userGroupsContainer.appendChild(groupElement);
      });
      userElement.appendChild(userGroupsContainer);
      usersContainer.appendChild(userElement);
    });
  } catch (error) {
    console.log(error);
  }
});
