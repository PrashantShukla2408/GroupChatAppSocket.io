const path = require("path");

const express = require("express");

const groupControllers = require("../controllers/groupControllers");

const auth = require("../middlewares/auth");
const { group } = require("console");

const router = express();

router.post("/create", auth, groupControllers.createGroup);
router.get("/userGroups/:userId", groupControllers.getUserGroups);
router.get("/groupUsers/:groupId", groupControllers.getGroupUsers);
router.post("/sendGroupMessage", auth, groupControllers.sendGroupMessage);
router.get("/getGroupMessages/:groupId", groupControllers.getGroupMessages);
router.get("/getGroupAdmin/:groupId", auth, groupControllers.getGroupAdmin);
router.get("/getGroupDetails/:groupId", auth, groupControllers.getGroupDetails);
router.put("/editGroup/:groupId", auth, groupControllers.editGroup);
router.put(
  "/changeGroupAdmin/:groupId",
  auth,
  groupControllers.changeGroupAdmin
);
router.delete("/deleteGroup/:groupId", auth, groupControllers.deleteGroup);
router.post(
  "/uploadGroupMediaFile",
  auth,
  groupControllers.uploadGroupMediaFile
);

module.exports = router;
