const express = require("express");
const taskController = require("../controller/task-controller");
const { check, body } = require("express-validator");

const router = express.Router();

router.patch("/updateUser/:userId", taskController.updateUser);

router.post(
    "/newUser",
    [body("name", "Invalid Name").isLength({ min: 3 })],
    taskController.createUsers
);

router.get("/allUser", taskController.getAllUser);

router.get("/:userId", taskController.getSingleUser);

module.exports = router;
