document.addEventListener("DOMContentLoaded", async () => {
  const groupUserscontainer = document.getElementById("groupUsersContainer");
  const groupChatWindow = document.getElementById("groupChatWindow");
  const groupMessageInput = document.getElementById("groupMessageInput");
  const sendGroupMessageButton = document.getElementById(
    "sendGroupMessageButton"
  );
  const adminContainer = document.getElementById("adminContainer");
  const groupMediaUploadButton = document.getElementById(
    "groupMediaUploadButton"
  );

  const backendURL = "http://localhost:5500";
  const socket = io(backendURL);

  const urlParams = new URLSearchParams(window.location.search);
  const groupId = urlParams.get("groupId");
  const groupName = urlParams.get("groupName");

  document.getElementById("groupName").innerHTML = `${groupName}`;

  const token = localStorage.getItem("token");
  let userId;

  async function getUser() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${backendURL}/users/user`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const user = response.data.user;
      userId = user.id;
      socket.emit("joinGroupChat", { userId, groupId });
    } catch (error) {
      console.log(error);
    }
  }

  async function getGroupAdmin() {
    const response = await axios.get(
      `${backendURL}/groups/getGroupAdmin/${groupId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const groupAdmin = response.data.groupAdmin;
    if (groupAdmin) {
      adminContainer.innerHTML = `Admin: ${groupAdmin.User.name}`;
      const userId = response.data.userId;
      if (groupAdmin.userId === userId) {
        isAdmin = true;
        enableAdminPowers();
      }
    }
  }

  async function getGroupUsers() {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `${backendURL}/groups/groupUsers/${groupId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      groupUserscontainer.innerHTML = "In this group:";
      const groupUsers = response.data.groupUsers;
      groupUsers.forEach((groupUser) => {
        const groupUserElement = document.createElement("div");
        groupUserElement.innerHTML = `
            <p>${groupUser.name}`;
        groupUserscontainer.appendChild(groupUserElement);
      });
    } catch (error) {
      console.log(error);
    }
  }

  async function getGroupMessages() {
    try {
      const response = await axios.get(
        `${backendURL}/groups/getGroupMessages/${groupId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const groupMessages = response.data.groupMessages;
      console.log(groupMessages);
      groupMessages.forEach((groupMessage) => {
        displayGroupMessage(groupMessage);
      });
    } catch (error) {
      console.log(error);
    }
  }

  function displayGroupMessage(groupMessage) {
    const groupMessageElement = document.createElement("div");
    const senderName = groupMessage.sender ? groupMessage.sender.name : "You";
    groupMessageElement.innerHTML = `
            <p>${senderName}: ${groupMessage.message}</p>
            `;
    groupChatWindow.appendChild(groupMessageElement);
  }

  sendGroupMessageButton.addEventListener("click", async (req, res) => {
    const token = localStorage.getItem("token");
    const groupMessage = groupMessageInput.value;

    const newGroupMessage = {
      sender: { name: "You" },
      senderId: userId,
      groupId: groupId,
      message: groupMessage,
    };

    socket.emit("sendGroupMessage", newGroupMessage);
    displayGroupMessage({ senderId: userId, groupMessage });
    groupMessageInput.value = "";
  });

  window.addEventListener("beforeunload", () => {
    socket.disconnect();
  });

  groupMediaUploadButton.addEventListener("click", async () => {
    const groupMediaFile = document.getElementById("groupMediaFile").files[0];
    console.log(groupMediaFile);

    const formData = new FormData();
    formData.append("file", groupMediaFile);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${backendURL}/groups/uploadGroupMediaFile`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const fileURL = response.data.fileUrl;

      const newGroupMessage = {
        sender: { name: "You" },
        senderId: userId,
        groupId: groupId,
        message: `File uploaded: <a href="${fileURL}" target="_blank">${groupMediaFile.name}</a>`,
      };
      socket.emit("sendGroupMessage", newGroupMessage);
      displayGroupMessage(newGroupMessage);
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("receiveGroupMessage", (groupMessage) => {
    displayGroupMessage(groupMessage);
  });

  function enableAdminPowers() {
    const adminActionContainer = document.createElement("div");
    adminActionContainer.innerHTML = `
    <button id="editGroupButton">Edit Group</button>
    <button id="changeGroupAdminButton">Change Group Admin</button>
    <button id="deleteGroupButton">Delete Group</button>
    `;
    adminContainer.appendChild(adminActionContainer);
    document
      .getElementById("editGroupButton")
      .addEventListener("click", async () => {
        window.location.href = `../views/editGroup.html?groupId=${groupId}&groupName=${groupName}`;
      });
    document
      .getElementById("changeGroupAdminButton")
      .addEventListener("click", () => {
        window.location.href = `../views/changeGroupAdmin.html?groupId=${groupId}&groupName=${groupName}`;
      });
    document
      .getElementById("deleteGroupButton")
      .addEventListener("click", async () => {
        try {
          const response = await axios.delete(
            `${backendURL}/groups/deleteGroup/${groupId}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          console.log(response.data);
          alert("Group deleted successfully");
          window.location.href = "../views/chatWith.html";
        } catch (error) {
          console.error(error);
        }
      });
  }

  getUser();
  getGroupUsers();
  getGroupAdmin();
  getGroupMessages();
});
