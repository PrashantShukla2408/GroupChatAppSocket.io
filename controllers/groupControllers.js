const path = require("path");

const sequelize = require("../util/database");
const { Op } = require("sequelize");

const User = require("../models/userModel");
const Group = require("../models/groupModel");
const GroupUser = require("../models/groupUserModel");
const GroupMessage = require("../models/groupMessageModel");

exports.createGroup = async (req, res) => {
  try {
    const { groupName, selectedUsers } = req.body;
    const creatorId = req.userId;

    const group = await Group.create({
      groupName: groupName,
    });

    const nonAdminUsers = selectedUsers.filter(
      (userId) => userId !== creatorId.toString()
    );

    const groupUsers = nonAdminUsers.map((userId) => ({
      groupId: group.id,
      userId: userId,
      isAdmin: false,
    }));

    groupUsers.push({
      groupId: group.id,
      userId: creatorId,
      isAdmin: true,
    });

    await GroupUser.bulkCreate(groupUsers);
    res
      .status(201)
      .json({ message: "Group created successfully", groupId: group.id });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creating group" });
  }
};

exports.getUserGroups = async (req, res) => {
  const userId = req.params.userId;
  try {
    const userGroups = await Group.findAll({
      attributes: ["groupName", "id"],
      include: [
        {
          model: User,
          attributes: [],
          through: { attributes: [] },
          where: { id: userId },
        },
      ],
    });
    console.log(userGroups);
    res.status(200).json({ userGroups: userGroups });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error getting groups" });
  }
};

exports.getGroupUsers = async (req, res) => {
  const groupId = req.params.groupId;
  try {
    const groupUsers = await User.findAll({
      attributes: ["name", "id"],
      include: [
        {
          model: Group,
          attributes: [],
          through: { attributes: [] },
          where: { id: groupId },
        },
      ],
    });
    console.log(groupUsers);
    res.status(200).json({ groupUsers: groupUsers });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error getting group users" });
  }
};

exports.sendGroupMessage = async (req, res) => {
  const { groupId, groupMessage } = req.body;
  const userId = req.userId;

  try {
    const newGroupMessage = await GroupMessage.create({
      groupId: groupId,
      message: groupMessage,
      senderId: userId,
    });
    res.status(201).json({
      message: "Group message sent successfuly",
      messageId: newGroupMessage.id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error sending group message" });
  }
};

exports.getGroupMessages = async (req, res) => {
  const groupId = req.params.groupId;
  try {
    const groupMessages = await GroupMessage.findAll({
      attributes: ["message"],
      where: { groupId: groupId },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["name"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });
    res.status(200).json({ groupMessages: groupMessages });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error getting group messages" });
  }
};

exports.getGroupAdmin = async (req, res) => {
  const userId = req.userId;
  const groupId = req.params.groupId;
  try {
    const groupAdmin = await GroupUser.findOne({
      where: {
        groupId: groupId,
        isAdmin: true,
      },
      include: [
        {
          model: User,
          attributes: ["name"],
        },
      ],
    });
    res.status(200).json({ groupAdmin: groupAdmin, userId: userId });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error getting group admin" });
  }
};

exports.getGroupDetails = async (req, res) => {
  const groupId = req.params.groupId;
  try {
    const groupUsers = await GroupUser.findAll({
      where: {
        groupId: groupId,
      },
      include: [
        {
          model: User,
          attributes: ["id", "name"],
        },
      ],
    });

    const groupUsersId = groupUsers.map((groupUser) => groupUser.User.id);

    const nonGroupUsers = await User.findAll({
      where: {
        id: {
          [Op.notIn]: groupUsersId,
        },
      },
      attributes: ["id", "name"],
    });

    const groupAdmin = await GroupUser.findOne({
      where: {
        groupId: groupId,
        isAdmin: true,
      },
      include: [
        {
          model: User,
          attributes: ["id", "name"],
        },
      ],
    });

    res.status(200).json({
      groupUsers: groupUsers,
      nonGroupUsers: nonGroupUsers,
      groupAdmin: groupAdmin,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error getting group details" });
  }
};

exports.editGroup = async (req, res) => {
  const groupId = req.params.groupId;

  const { groupName, selectedUsersToAdd, selectedUsersToRemove } = req.body;

  try {
    const group = await Group.findByPk(groupId);
    group.groupName = groupName;
    await group.save();

    const existingGroupUsers = await GroupUser.findAll({
      where: {
        groupId: groupId,
      },
      attributes: ["userId"],
    });

    const existingGroupUsersId = existingGroupUsers.map(
      (groupUser) => groupUser.userId
    );
    const newUsersToAdd = selectedUsersToAdd.filter(
      (userId) => !existingGroupUsersId.includes(userId)
    );

    console.log(newUsersToAdd);

    if (newUsersToAdd.length > 0) {
      const newGroupUsers = newUsersToAdd.map((userId) => ({
        userId: userId,
        groupId: groupId,
        isAdmin: false,
      }));

      await GroupUser.bulkCreate(newGroupUsers);
      console.log("New users added");
    }

    if (selectedUsersToRemove.length > 0) {
      await GroupUser.destroy({
        where: {
          groupId: groupId,
          userId: selectedUsersToRemove,
        },
      });
    }

    res.status(200).json({ message: "Group updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error updating group" });
  }
};

exports.changeGroupAdmin = async (req, res) => {
  const t = await sequelize.transaction();
  const groupId = req.params.groupId;

  const { selectedAdmin } = req.body;

  try {
    await GroupUser.update(
      { isAdmin: false },
      {
        where: {
          groupId: groupId,
          isAdmin: true,
        },
        transaction: t,
      }
    );
    await GroupUser.update(
      { isAdmin: true },
      {
        where: {
          groupId: groupId,
          userId: selectedAdmin,
        },
        transaction: t,
      }
    );

    await t.commit();

    res.status(200).json({ message: "Group admin changed successfully" });
  } catch (error) {
    await t.rollback();
    console.log(error);
    res.status(500).json({ message: "Error changing group admin" });
  }
};

exports.deleteGroup = async (req, res) => {
  const groupId = req.params.groupId;
  try {
    await Group.destroy({
      where: {
        id: groupId,
      },
    });
    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error deleting group" });
  }
};
