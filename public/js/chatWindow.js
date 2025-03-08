document.addEventListener("DOMContentLoaded", () => {
  const sendButton = document.getElementById("sendButton");
  const messageStatus = document.getElementById("messageStatus");
  const messageContainer = document.getElementById("messageContainer");
  const userContainer = document.getElementById("userContainer");
  const chatWithContainer = document.getElementById("chatWithContainer");
  const createGroupButton = document.getElementById("createGroupButton");

  const urlParams = new URLSearchParams(window.location.search);
  const chatWithId = urlParams.get("chatWithId");

  if (!chatWithId) {
    alert("Invalid chat id, Please select a user to chat with");
    window.location.href = "../views/chatWith.html";
  }

  createGroupButton.addEventListener("click", () => {
    window.location.href = "../views/createGroup.html";
  });

  const backendURL = "http://localhost:5500";
  const socket = io(backendURL);

  let userId;

  async function getUser() {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`${backendURL}/users/user`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const user = response.data.user;
      userId = user.id;
      socket.emit("joinChat", { userId, chatWithId });
      userContainer.innerHTML = `Welcome <p>${user.name}</p>`;
    } catch (error) {
      console.log(error);
    }
  }

  async function getChatWithUser() {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `${backendURL}/users/user/${chatWithId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const chatWithUser = response.data.user;
      chatWithContainer.innerHTML = `Chatting with: <p>${chatWithUser.name}</p>`;
    } catch (error) {
      console.log(error);
    }
  }

  async function getOldMessages() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${backendURL}/privateMessages?chatWithId=${chatWithId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const allMessages = response.data.allMessages;
      allMessages.forEach((message) => {
        displayMessage(message);
      });
    } catch (error) {
      console.log(error);
    }
  }

  sendButton.addEventListener("click", async () => {
    const token = localStorage.getItem("token");
    const message = document.getElementById("message").value;

    if (!message) {
      return;
    }

    const newMessage = {
      senderId: userId,
      receiverId: parseInt(chatWithId),
      message: message,
    };

    socket.emit("sendMessage", newMessage);
    displayMessage({ sender: userId, message: message });
    document.getElementById("message").value = "";
  });

  socket.on("receiveMessage", (message) => {
    displayMessage(message);
  });

  window.addEventListener("beforeunload", () => {
    socket.disconnect();
  });

  function displayMessage(message) {
    const messageElement = document.createElement("div");
    const senderName = message.sender ? message.sender.name : "You";
    messageElement.innerHTML = `<p>${senderName}:${message.message}</p>`;
    messageContainer.appendChild(messageElement);
  }

  // async function getMessages() {
  //   const token = localStorage.getItem("token");
  //   try {
  //     const response = await axios.get(
  //       `${backendURL}/privateMessages?chatWithId=${chatWithId}`,
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );
  //     const allMessages = response.data.allMessages;
  //     allMessages.forEach((message) => {
  //       displayMessage(message);
  //     });
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

  // function displayMessage(message) {
  //   const messageElement = document.createElement("div");
  //   const senderName = message.sender ? message.sender.name : "You";
  //   messageElement.innerHTML = `<p>${senderName}:${message.message}</p>`;
  //   messageContainer.appendChild(messageElement);
  // }

  // function storeMessageInsideLocalStorage(message) {
  //   let recentMessagesArray =
  //     JSON.parse(localStorage.getItem(recentMessagesKey)) || [];
  //   recentMessagesArray.push(message);
  //   if (recentMessagesArray.length > 10) {
  //     recentMessagesArray.shift();
  //   }
  //   localStorage.setItem(
  //     recentMessagesKey,
  //     JSON.stringify(recentMessagesArray)
  //   );
  // }

  // async function getOlderMessages() {
  //   if (isFetchingOlderMessages) return [];

  //   isFetchingOlderMessages = true;
  //   const token = localStorage.getItem("token");

  //   try {
  //     console.log(
  //       `Fetching older messages, oldestMessageId:${oldestMessageId}`
  //     );
  //     const response = await axios.get(
  //       `${backendURL}/olderMessages?oldestMessageId=${oldestMessageId}&chatWithId=${chatWithId}`,
  //       {
  //         headers: {
  //           "Content-Type": "application/JSON",
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     const olderMessages = response.data.olderMessages || [];
  //     if (olderMessages.length > 0) {
  //       oldestMessageId = olderMessages[olderMessages.length - 1].messageId;
  //       displayMessages(olderMessages, true); // Prepend old messages
  //     } else {
  //       console.log("No older messages found");
  //     }
  //     return olderMessages;
  //   } catch (error) {
  //     console.error(error);
  //     return [];
  //   } finally {
  //     isFetchingOlderMessages = false;
  //   }
  // }

  // async function loadMessages() {
  //   let scrollPosition = messageContainer.scrollTop;

  //   let recentMessagesArray =
  //     JSON.parse(localStorage.getItem(recentMessagesKey)) || [];

  //   let olderMessages = await getOlderMessages();

  //   let allMessages = [...olderMessages, ...recentMessagesArray];

  //   let uniqueMessages = Array.from(
  //     new Map(
  //       allMessages.map((message) => [message.messageId, message])
  //     ).values()
  //   );

  //   uniqueMessages.sort((a, b) => a.messageId - b.messageId);

  //   displayedMessages.clear();
  //   messageContainer.innerHTML = "";
  //   displayMessages(uniqueMessages);

  //   messageContainer.scrollTop = scrollPosition;
  // }

  // function displayMessages(messages, prepend = false) {
  //   if (!messages || messages.length === 0) return;

  //   messages.forEach((message) => {
  //     if (!displayedMessages.has(message.messageId)) {
  //       displayedMessages.add(message.messageId);

  //       const messageDiv = document.createElement("div");
  //       const senderName = message.sender ? message.sender.name : "You";
  //       messageDiv.innerHTML = `<p>${senderName}: ${message.message}</p>`;

  //       if (prepend) {
  //         messageContainer.prepend(messageDiv);
  //       } else {
  //         messageContainer.appendChild(messageDiv);
  //         scrollToBottom();
  //       }
  //     }
  //   });
  // }

  // function scrollToBottom() {
  //   messageContainer.scrollTop = messageContainer.scrollHeight;
  // }

  // messageContainer.addEventListener("scroll", async () => {
  //   if (messageContainer.scrollTop === 0) {
  //     let olderMessages = await getOlderMessages();
  //     displayMessages(olderMessages, true);
  //   }
  // });

  getUser();
  getChatWithUser();
  getOldMessages();
  // loadMessages();

  // setInterval(async () => {
  //   let recentMessagesArray =
  //     JSON.parse(localStorage.getItem(recentMessagesKey)) || [];

  //   let olderMessages = await getOlderMessages();

  //   let allMessages = [...olderMessages, ...recentMessagesArray];

  //   let uniqueMessages = Array.from(
  //     new Map(
  //       allMessages.map((message) => [message.messageId, message])
  //     ).values()
  //   );

  //   uniqueMessages.sort((a, b) => a.messageId - b.messageId);

  //   displayMessages(uniqueMessages);
  // }, 3000);
});
