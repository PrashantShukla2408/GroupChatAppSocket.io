document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const groupId = urlParams.get("groupId");
  const groupName = urlParams.get("groupName");

  const backendURL = "http://localhost:5500";

  document.getElementById("groupName").value = groupName;

  const addGroupUsersContainer = document.getElementById(
    "addGroupUsersContainer"
  );
  const removeGroupUsersContainer = document.getElementById(
    "removeGroupUsersContainer"
  );

  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      `${backendURL}/groups/getGroupDetails/${groupId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const { groupUsers, nonGroupUsers, groupAdmin } = response.data;

    addGroupUsersContainer.innerHTML = "<h3>Add To Group</h3>";
    nonGroupUsers.forEach((nonGroupUser) => {
      const userElement = document.createElement("div");
      userElement.innerHTML = `
            <input type="checkbox" id="users_${nonGroupUser.id}" name="users" value="${nonGroupUser.id}">
            <label for="users_${nonGroupUser.id}">${nonGroupUser.name}</label>
        `;
      addGroupUsersContainer.appendChild(userElement);
    });

    removeGroupUsersContainer.innerHTML = "<h3>Remove from Group</h3>";
    groupUsers.forEach((groupUser) => {
      const groupUserElement = document.createElement("div");
      groupUserElement.innerHTML = `
            <input type="checkbox" id="users_${groupUser.User.id}" name="users" value="${groupUser.User.id}">
            <label for="users_${groupUser.User.id}">${groupUser.User.name}</label>
        `;
      removeGroupUsersContainer.appendChild(groupUserElement);
    });
  } catch (error) {
    console.log("Error fetching group users: ", error);
  }

  const editGroupForm = document.getElementById("editGroupForm");

  editGroupForm.addEventListener("submit", handleFormSubmit);

  async function handleFormSubmit(event) {
    event.preventDefault();
    const token = localStorage.getItem("token");

    const groupName = document.getElementById("groupName").value;
    const selectedUsersToAdd = Array.from(
      document.querySelectorAll(
        '#addGroupUsersContainer input[name="users"]:checked'
      )
    ).map((checkbox) => checkbox.value);
    const selectedUsersToRemove = Array.from(
      document.querySelectorAll(
        '#removeGroupUsersContainer input[name="users"]:checked'
      )
    ).map((checkbox) => checkbox.value);

    const groupData = {
      groupName: groupName,
      selectedUsersToAdd: selectedUsersToAdd,
      selectedUsersToRemove: selectedUsersToRemove,
    };

    try {
      const response = await axios.put(
        `${backendURL}/groups/editGroup/${groupId}`,
        groupData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data);
      alert("Group edited successfully");
      window.location.href = "../views/chatWith.html";
    } catch (error) {
      console.log(error);
    }
  }
});
