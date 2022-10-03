const userModel = require("../model/task-model");
const httpError = require("../model/http-error");
const { validationResult } = require("express-validator");
const nanoid = require('nanoid').nanoid;
const sharp = require('sharp');
const fs = require('fs');
const bcrypt = require('bcrypt');

exports.createUsers = async (req, res, next) => {
    const validatiorError = validationResult(req);
    if (!validatiorError.isEmpty()) {
        return res.status(400).json({ msg: validatiorError.array()[0].msg });
    }
    if (req.body.image) {
        let imageUpdateCheck = req.body.image.substring(0, 6)
            if (imageUpdateCheck !== 'public') {
                let img = req.body.image.split(';base64,').pop()
                let path = 'public/user/' + nanoid(21) + '.jpg'
                let inputBuffer = Buffer.from(img, 'base64')
                sharp(inputBuffer).toFile(path)
                req.body.image = path
        }
    }
    const { name, phone, email, role, image} = req.body;
    let retrievedPassword = req.body.password;
    const salt = await bcrypt.genSalt(10); 
    const password = await bcrypt.hash(retrievedPassword,salt);
    const newUser = new userModel({
        name,
        phone,
        email,
        password,
        role,
        image,
        userId : nanoid(5)
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
        user = await userModel.findOne({userId : userId});
    } catch (err) {
        const error = new httpError("Error in retrieving user Data", 422);
        return next(error);
    }
    if (!user) {
        throw new httpError("User not found", 404);
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
    if (req.body.image) {
        let imageUpdateCheck = req.body.image.substring(0, 6)
            if (imageUpdateCheck !== 'public') {
                let img = req.body.image.split(';base64,').pop()
                let path = 'public/user/' + nanoid(21) + '.jpg'
                let inputBuffer = Buffer.from(img, 'base64')
                sharp(inputBuffer).toFile(path)
                req.body.image = path
        }
    }

    let prevInfo;
    try{
        prevInfo = await userModel.findOne({ userId : userId });
    }catch (err) {
        const error = new httpError("Error updating user", 500);
        return next(error);
    }
    
    if(prevInfo){
        let prevImg = prevInfo.image;
        if(prevImg != ''){
            let prevImgPath = './'+prevImg;
            //console.log(prevImgPath);
            fs.unlink(prevImgPath, (err) => {
                if(err){
                    console.log(err);   
                    return;
                }
            })
        }
    }

    let updatedUser;
    try {
        updatedUser = await userModel.findOneAndUpdate(
            { userId : userId },
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
