import express from "express";
import UserController from "../controllers/userControler.js"
import { authUser } from "../config/auth.js";
import { upload } from "../utils/multer.js";
import userModel from "../dao/models/users.js";
import { validateDocumentKeys } from "../utils/validateDocumentkeys.js";

const userRouter = express.Router(); 

const userController = new UserController(); 

userRouter.get("/", authUser(['admin']), (req, res) => userController.getAll(req, res)); 

userRouter.put('/premiun/:uid', authUser(['admin']), (req, res) => userController.premiun(req, res)); 


userRouter.post('/:uid/documents', upload.fields([
    { name: "identificacion", maxCount: 1 },
    { name: "domicilio", maxCount: 1 },
    { name: "cuenta", maxCount: 1 },
    { name: "profileImage", maxCount: 1 },
    { name: "productImage", maxCount: 1 }
]), (req, res) => userController.uploadDocuments(req, res)); 

userRouter.delete("/delete", authUser(['admin']),(req,res)=>userController.delate(req,res))

userRouter.delete("/delete/:uid", authUser(['admin']),(req,res)=>userController.deleteUser(req,res))

export default userRouter;