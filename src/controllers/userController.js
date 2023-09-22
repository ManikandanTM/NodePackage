import { v4 as uuidv4 } from 'uuid';
import bcrypt from "bcrypt";
import mongoose from 'mongoose';

// models
import User from '../models/userModel.js';

// auth middleware
import userAuth from '../middlewares/userAuth.js';

export const access_token_expiry = process.env.ACCESS_TOKEN_EXPIRY;

const userController = {};

const verifyPassword = async (email, password) => {
    const userDetails = await User.findOne({ email: email });
    if (!userDetails || !bcrypt.compareSync(password, userDetails.password)) {
        return false;
    } else {
        return true;
    }
};

const isOldPassword = async (newPassword, oldPassword) => {
    try {
        return await bcrypt.compare(newPassword, oldPassword);
    } catch (error) {
        throw error
    }
};

const isSamePassword = async (newpassword, confirmPassword) => {
    try {
        return await (newpassword === confirmPassword);
    } catch (error) {
        throw error
    }
};

userController.signIn = async (req, res, next) => {
    if (!req.body.email || !req.body.password) {
        return res.status(200).json({ status_code: 400, message: "Invalid Params" });
    }
    else {
        try {
            let userDetails = {};
            userDetails = await User.findOne({ email: req.body.email });

            if (userDetails) {

                const validCredentials = await verifyPassword(req.body.email, req.body.password);

                if (!validCredentials)
                    return res.status(200).json({ status_code: 400, message: "Invalid Credentials" });

                const userData = { email: userDetails.email };
                const access_token = userAuth.createAccessToken(userData, {
                    expiresIn: access_token_expiry,
                });
                return res.status(200).json({
                    status_code: 200,
                    access_token: access_token,
                    result: {
                        "id": userDetails._id,
                        "name": userDetails.name,
                        "email": userDetails.email,
                    }
                });
            }
            else {
                return res.status(200).json({ status_code: 400, message: "Invalid Credentials"});
            }
        }
        catch (err) {
            return res.status(200).json({ status_code: 500, message: "Something went wrong" });
        }
    }
};

userController.userDetails = async (req, res, next) => {
    if (!req.params.profileId) {
        return res.status(200).json({ status_code: 400, message: "Invalid Params" });
    }
    else {
        try {
            let userData = {};
            let profileId = mongoose.Types.ObjectId(req.params.profileId);
            User.findById(profileId, function (error, userDetails) {
                if (!error) {
                    userData.name = userDetails.name;
                    userData.email = userDetails.email;
                    userData.phoneNumber = userDetails.phoneNumber;
                    userData.bio = userDetails.bio;
                    return res.status(200).json({
                        status_code: 200,
                        result: userData
                    });
                } else {
                    return res.status(200).json({ status_code: 500, message: "Something went wrong" });
                }
            });
        }
        catch (err) {
            return res.status(200).json({ status_code: 500, message: "Something went wrong" });
        }
    }
};

userController.updateUser = async (req, res, next) => {
    if (!req.body.user_id || !req.body.name || !req.body.email) {
        return res.status(200).json({ status_code: 400, message: "Invalid Params" });
    }
    else {
        try {
            let userData = {};
            let userId = mongoose.Types.ObjectId(req.body.user_id);
            userData.name = req.body.name;
            userData.email = req.body.email;
            User.findByIdAndUpdate(userId, { "name": req.body.name, "email": req.body.email }, function (error, userDetails) {
                if (!error) {
                    return res.status(200).json({
                        status_code: 200,
                        message: "Profile has been updated successfully"
                    });
                } else {
                    return res.status(200).json({ status_code: 500, message: "Something went wrong" });
                }
            });
        }
        catch (err) {
            return res.status(200).json({ status_code: 500, message: "Something went wrong" });
        }
    }
};

userController.changePassword = async (req, res, next) => {
    if (!req.body.user_id || !req.body.password || !req.body.new_password || !req.body.confirm_password) {
        return res.status(200).json({ status_code: 400, message: "Invalid Params" });
    }
    else {
        try {

            let userId = mongoose.Types.ObjectId(req.body.user_id);

            let userDetails = await User.findById(userId);

            if (!userDetails)
                return res.status(200).json({ status_code: 401, message: "Invalid Credentials" });

            const samePasswordCheck = await isSamePassword(req.body.new_password, req.body.confirm_password);

            if (!samePasswordCheck)
                return res.status(200).json({ status_code: 400, message: "New Password & Confirm Password are not same" });

            const verifyPasswordCheck = await verifyPassword(userDetails.email, req.body.password);

            if (!verifyPasswordCheck)
                return res.status(200).json({ status_code: 400, message: "Old Password is incorrect" });

            const oldPasswordCheck = await isOldPassword(req.body.new_password, userDetails.password);

            if (oldPasswordCheck)
                return res.status(200).json({ status_code: 400, message: "New password cannot be same as your old password" });

            let password = req.body.new_password;
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            userDetails.password = hashedPassword;
            await userDetails.save();
            return res.status(200).json({
                status_code: 200,
                message: "Password has been changed successfully"
            });
        }
        catch (err) {
            return res.status(200).json({ status_code: 500, message: "Something went wrong" });
        }
    }
};


userController.createUser = async (req, res, next) => {
    if (!req.body.name || !req.body.email || !req.body.password) {
        return res.status(200).json({ status_code: 400, message: "Invalid Params" });
    }
    else {
        try {
            let userData = {};
            userData.name = req.body.name;
            userData.email = req.body.email;
            let password = req.body.password;
            if (req.body.phoneNumber)
                userData.phoneNumber = req.body.phoneNumber;
            if(req.body.bio)
                userData.bio = req.body.bio;
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            userData.password = hashedPassword;
            let newUser = new User(userData);
            await newUser.save(async function (error, userDetails) {
                if (!error) {
                    return res.status(200).json({
                        status_code: 200,
                        message: "User has been saved successfully"
                    });
                }
                else {
                    return res.status(200).json({ status_code: 500, message:"Something went wrong" });
                }
            });
        }
        catch (err) {
            return res.status(200).json({ status_code: 500, message: "Something went wrong" });
        }
    }
};

userController.deleteUser = async (req, res, next) => {
    if (!req.body.user_id ) {
        return res.status(200).json({ status_code: 400, message: "Invalid Params" });
    }
    else {
        try {
            let userData = {};
            let userId = mongoose.Types.ObjectId(req.body.user_id);
            User.findByIdAndDelete(userId,  function (error, userDetails) {
                if (!error) {
                    return res.status(200).json({
                        status_code: 200,
                        message: "Profile has been deleted successfully"
                    });
                } else {
                    return res.status(200).json({ status_code: 500, message: "Something went wrong" });
                }
            });
        }
        catch (err) {
            return res.status(200).json({ status_code: 500, message: "Something went wrong" });
        }
    }
};

export default userController;