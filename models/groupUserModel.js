const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const GroupUser = sequelize.define(
  "GroupUser",
  {
    groupUserId: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    groupId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "Groups",
        key: "id",
      },
    },
    isAdmin: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ["userId", "groupId"],
      },
    ],
  }
);

module.exports = GroupUser;
