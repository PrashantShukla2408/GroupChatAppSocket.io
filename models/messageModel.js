const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const Message = sequelize.define("Message", {
  messageId: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  message: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  UserId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: "Users",
      key: "id",
    },
  },
  receiverId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: "Users",
      key: "id",
    },
  },
});

module.exports = Message;
