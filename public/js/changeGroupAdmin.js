document.addEventListener("DOMContentLoaded", async () => {
  const URLParams = new URLSearchParams(window.location.search);
  const groupId = URLParams.get("groupId");
  const groupName = URLParams.get("groupName");

  const backendURL = "http://localhost:5500";

  document.getElementById("groupNameContainer").innerHTML = `${groupName}`;

  const groupUsersContainer = document.getElementById("groupUsersContainer");

  async function getGroupUsers() {
    const token = localStorage.getItem("token");

    try {
      const response = await axios.get(
        `${backendURL}/groups/getGroupDetails/${groupId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const { groupUsers, groupAdmin } = response.data;
      groupUsersContainer.innerHTML = "In this group:";
      groupUsers.forEach((groupUser) => {
        const isChecked =
          groupUser.User.id === groupAdmin.User.id ? "checked" : "";
        const groupUserElement = document.createElement("div");
        groupUserElement.innerHTML = `
                    <input type="radio" id="users_${groupUser.User.id}" name="users" value="${groupUser.User.id}" ${isChecked}>
                    <label for="users_${groupUser.User.id}">${groupUser.User.name}</label>
                `;
        groupUsersContainer.appendChild(groupUserElement);
      });
    } catch (error) {
      console.error(error);
    }
  }

  const changeGroupAdminForm = document.getElementById("changeGroupAdminForm");
  changeGroupAdminForm.addEventListener("submit", handleChangeGroupAdmin);

  async function handleChangeGroupAdmin(event) {
    event.preventDefault();
    const token = localStorage.getItem("token");

    const selectedAdmin = document.querySelector(
      'input[name="users"]:checked'
    ).value;
    const changeGroupAdminData = {
      selectedAdmin: selectedAdmin,
    };

    try {
      const response = await axios.put(
        `${backendURL}/groups/changeGroupAdmin/${groupId}`,
        changeGroupAdminData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data);
      alert("Group Admin changed successfully");
      window.location.href = `../views/groupChatWindow.html?groupId=${groupId}&groupName=${groupName}`;
    } catch (error) {
      console.error(error);
    }
  }

  getGroupUsers();
});
