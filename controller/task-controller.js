import { nanoid } from 'nanoid';
const userModel = require("../model/task-model");
const httpError = require("../model/http-error");
const { validationResult } = require("express-validator");


exports.createUsers = async (req, res, next) => {
    const validatiorError = validationResult(req);
    if (!validatiorError.isEmpty()) {
        return res.status(400).json({ msg: validatiorError.array()[0].msg });
    }
    const { name, phone, email, password, role, image } = req.body;
    const userId = nanoid(5);
    console.log(userId);
    const newUser = new userModel({
        name,
        phone,
        email,
        password,
        role,
        image,
        userId
    });
    try {
        await newUser.save();
    } catch (err) {
        const error = new httpError("User creation failed", 500);
        return next(error);
    }
    res.status(201).json({ msg: "New user created successfully." });
};

exports.getSingleUser = async (req, res, next) => {
    const userId = req.params.userId;
    let user;
    try {
        user = await userModel.findById(userId);
    } catch (err) {
        const error = new httpError("Error in retrieving user Data", 422);
        return next(error);
    }
    if (!user) {
        throw new Error("User not found", 404);
    }
    res.status(200).json({
        userInfo: user,
    });
};

exports.getAllUser = async (req, res, next) => {
    let users;
    try {
        users = await userModel.find();
    } catch (err) {
        const error = new httpError("Error in retrieving all user Data", 422);
        return next(error);
    }
    if (!users) {
        throw new httpError("No user exist", 404);
    }
    res.status(201).json({
        allUsers: users,
    });
};

exports.updateUser = async (req, res, next) => {
    const userId = req.params.userId;
    let updatedUser;
    try {
        updatedUser = await userModel.findOneAndUpdate(
            { _id: userId },
            { $set: req.body },
            { new: true }
        );
    } catch (err) {
        const error = new httpError("Error updating user", 500);
        return next(error);
    }
    res.status(202).json({
        msg: "User updated successfully",
        user: updatedUser,
    });
};
