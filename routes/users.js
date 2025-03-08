const path = require("path");
const express = require("express");

const userControllers = require("../controllers/userControllers");

const auth = require("../middlewares/auth");

const router = express();

router.post("/signup", userControllers.signup);
router.post("/login", userControllers.login);
router.get("/user", auth, userControllers.getUser);
router.get("/user/:id", userControllers.getUserById);
router.get("/allUsers", auth, userControllers.getAllUsers);

module.exports = router;
