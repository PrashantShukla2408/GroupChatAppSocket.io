require("dotenv").config();
const path = require("path");

const express = require("express");
const fileUpload = require("express-fileupload");
const http = require("http");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");

const userRoutes = require("./routes/users");
const messageRoutes = require("./routes/messages");
const groupRoutes = require("./routes/groups");

const rootDir = require("./util/path");

const sequelize = require("./util/database");

const User = require("./models/userModel");
const Message = require("./models/messageModel");
const Group = require("./models/groupModel");
const GroupUser = require("./models/groupUserModel");
const GroupMessage = require("./models/groupMessageModel");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public", "views")));
app.use(fileUpload());
app.use("/users", userRoutes);
app.use(messageRoutes);
app.use("/groups", groupRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "views", "index.html"));
});

User.hasMany(Message, { foreignKey: "UserId", as: "SentMessages" });
User.hasMany(Message, { foreignKey: "receiverId", as: "ReceivedMessages" });
Message.belongsTo(User, { as: "sender", foreignKey: "UserId" });
Message.belongsTo(User, { as: "receiver", foreignKey: "receiverId" });

User.belongsToMany(Group, { through: GroupUser, foreignKey: "userId" });
Group.belongsToMany(User, { through: GroupUser, foreignKey: "groupId" });

User.hasMany(GroupMessage, { foreignKey: "senderId" });
GroupMessage.belongsTo(User, { as: "sender", foreignKey: "senderId" });

GroupUser.belongsTo(User, { foreignKey: "userId" });
User.hasMany(GroupUser, { foreignKey: "userId" });

Group.hasMany(GroupMessage, { foreignKey: "groupId" });
GroupMessage.belongsTo(Group, { as: "Group", foreignKey: "groupId" });

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("joinChat", ({ userId, chatWithId }) => {
    const room = getRoomId(userId, chatWithId);
    socket.join(room);
    console.log(`User ${userId} joined room ${room}`);
  });

  socket.on("sendMessage", async (data) => {
    const { senderId, receiverId, message } = data;
    try {
      const newMessage = await Message.create({
        UserId: senderId,
        receiverId: receiverId,
        message,
      });
      console.log("Message saved to DB successfully");
      const room = getRoomId(senderId, receiverId);

      io.to(room).emit("receiveMessage", {
        senderId,
        receiverId,
        message: newMessage.message,
        createdAt: newMessage.createdAt,
      });
    } catch (error) {
      console.log(error);
    }
  });

  function getRoomId(user1, user2) {
    return [user1, user2].sort().join("_");
  }

  socket.on("joinGroupChat", ({ userId, groupId }) => {
    socket.join(groupId);
    console.log(`User ${userId} joined group:${groupId}`);
  });

  socket.on("sendGroupMessage", (groupMessageData) => {
    const { senderId, groupId, message } = groupMessageData;
    try {
      const newGroupMessage = GroupMessage.create({
        senderId: senderId,
        groupId: groupId,
        message: message,
      });

      io.to(groupId).emit("receiveGroupMessage", {
        senderId,
        groupId,
        message: newGroupMessage.message,
        createdAt: newGroupMessage.createdAt,
      });
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

sequelize
  .sync()
  .then((result) => {
    console.log(result);
    server.listen(process.env.PORT || 3000, () => {
      console.log("Server is running successfully");
    });
  })
  .catch((err) => {
    console.log(err);
  });
