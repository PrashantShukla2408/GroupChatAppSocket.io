const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/userModel");

exports.signup = async (req, res) => {
  const { name, email, phoneNumber, password } = req.body;
  try {
    const existingUser = await User.findOne({ where: { email: email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists, Please Login" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name,
      email: email,
      phoneNumber: phoneNumber,
      password: hashedPassword,
    });
    res.status(201).json({ message: "User created successfully", user: user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.login = async (req, res) => {
  const { phoneNumber, password } = req.body;
  try {
    const user = await User.findOne({
      where: {
        phoneNumber: phoneNumber,
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRETKEY);

    res
      .status(200)
      .json({ message: "User logged in successfully", token: token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getUser = async (req, res) => {
  const userId = req.userId;
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user: user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getUserById = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user: user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json({ users: users });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching users" });
  }
};
