const path = require("path");

const { Op } = require("sequelize");

const User = require("../models/userModel");
const Message = require("../models/messageModel");

exports.sendMessage = async (req, res) => {
  const userId = req.userId;
  const { chatWithId, message } = req.body;

  try {
    const newMessage = await Message.create({
      UserId: userId,
      receiverId: chatWithId,
      message: message,
    });
    res.status(201).json({
      message: "Message sent successfully",
      messageId: newMessage.messageId,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error sending message" });
  }
};

exports.getMessages = async (req, res) => {
  const userId = req.userId;
  try {
    const allMessages = await Message.findAll({
      include: [
        {
          model: User,
          attributes: ["name"],
        },
      ],
    });
    res.status(200).json({ allMessages: allMessages });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error getting messages" });
  }
};

exports.getOlderMessages = async (req, res) => {
  const { oldestMessageId, chatWithId } = req.query;
  const userId = req.userId;

  try {
    const olderMessages = await Message.findAll({
      where: {
        messageId: { [Op.lt]: oldestMessageId },
        [Op.or]: [
          { UserId: userId, receiverId: chatWithId },
          { UserId: chatWithId, receiverId: userId },
        ],
      },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["name"],
        },
        {
          model: User,
          as: "receiver",
          attributes: ["name"],
        },
      ],
      order: [["messageId", "DESC"]],
      limit: 10,
    });
    console.log(olderMessages);
    res.status(200).json({ olderMessages: olderMessages });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error getting older messages" });
  }
};

exports.getPrivateMessages = async (req, res) => {
  const userId = req.userId;
  const { chatWithId } = req.query;
  try {
    const privateMessages = await Message.findAll({
      where: {
        [Op.or]: [
          { UserId: userId, receiverId: chatWithId },
          { UserId: chatWithId, receiverId: userId },
        ],
      },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["name"],
        },
        {
          model: User,
          as: "receiver",
          attributes: ["name"],
        },
      ],
      order: [["messageId", "ASC"]],
    });
    console.log(privateMessages);
    res.status(200).json({ allMessages: privateMessages });
  } catch (error) {
    console.log(error);
  }
};
