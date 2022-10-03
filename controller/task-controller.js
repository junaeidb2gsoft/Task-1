const userModel = require("../model/task-model");
const httpError = require("../model/http-error");
const { validationResult } = require("express-validator");
const nanoid = require('nanoid').nanoid;
const sharp = require('sharp');
const fs = require('fs');
const bcrypt = require('bcrypt');

exports.createUsers = async (req, res, next) => {
    try {
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
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);
        
        req.body.password = hash;
        req.body.userId = nanoid(5);
    
        let user = await userModel.create(req.body);
        let jsonData = JSON.parse(JSON.stringify(user));
        delete jsonData.password;

        res.status(201).json({
            data: jsonData,
            success: true,
            message: 'User created successfully!'
        });
    } catch (err) {
        console.log('Error = ', err);
        res.status(500).json({
            data: null,
            success: false,
            message: 'Internal Server Error Ocurred!'
        });
    }
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
        data: user,
        success: true,
        message: 'View successfully!'
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
    try{
        const userId = req.params.userId;
        let prevInfo;
        let updatedUser;
        if (req.body.image) {
            let imageUpdateCheck = req.body.image.substring(0, 6)
            if (imageUpdateCheck !== 'public') {
                let img = req.body.image.split(';base64,').pop()
                let path = 'public/user/' + nanoid(21) + '.jpg'
                let inputBuffer = Buffer.from(img, 'base64')
                sharp(inputBuffer).toFile(path)
                req.body.image = path
            }
            prevInfo = await userModel.findOne({ userId : userId });
            if(prevInfo){
                let prevImg = prevInfo.image;
                if(prevImg != ''){
                    let prevImgPath = './'+prevImg;
                    fs.unlink(prevImgPath, (err) => {
                        if(err){
                            console.log(err);   
                            return;
                        }
                    })
                }
            }
        }
        updatedUser = await userModel.findOneAndUpdate(
            { userId : userId },
            { $set: req.body },
            { new: true }
        );
        let jsonData = JSON.parse(JSON.stringify(updatedUser));
        delete jsonData.password;
        res.status(202).json({
            data: jsonData,
            success: true,
            message: 'User updated successfully!'
        });
    }catch(err){
        res.status(500).json({
            data: null,
            success: false,
            message: 'Internal Server Error Ocurred!'
        });
    }
};
