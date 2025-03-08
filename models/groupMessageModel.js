const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const GroupMessage = sequelize.define("GroupMessage", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  groupId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: "Groups",
      key: "id",
    },
  },
  message: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  senderId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: "Users",
      key: "id",
    },
  },
});

module.exports = GroupMessage;
