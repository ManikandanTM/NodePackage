import express from "express";
import dotenv from 'dotenv';
dotenv.config();
const router = express.Router();

import userMiddleware from "../middlewares/userAuth.js";
import userController from "../controllers/userController.js";

// user routes
// userMiddleware.checkJwt
router.post("/signin", userController.signIn);
router.get("/user/:profileId", [], userController.userDetails);
router.post("/updateuser", userMiddleware.checkJwt, userController.updateUser);
router.post("/changepassword", userMiddleware.checkJwt, userController.changePassword);
router.post("/createuser", [], userController.createUser);
router.post("/deleteuser", [], userController.deleteUser);


export default router;


