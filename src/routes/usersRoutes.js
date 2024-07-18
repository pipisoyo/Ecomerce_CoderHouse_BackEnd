import express from "express";
import userControler from "../controllers/userControler.js"
import { authUser } from "../config/auth.js";
import { upload } from "../utils/multer.js";
import userModel from "../dao/models/users.js";
import { validateDocumentKeys } from "../utils/validateDocumentkeys.js";

const userRouter = express()

userRouter.get("/", authUser(['admin']), userControler.getAll)

userRouter.put('/premiun/:uid', authUser(['admin']), userControler.premiun);

userRouter.post('/:uid/documents', upload.fields([
        { name: "identificacion", maxCount: 1 },
        { name: "domicilio", maxCount: 1 },
        { name: "cuenta", maxCount: 1 },
        { name: "profileImage", maxCount: 1 },
        { name: "productImage", maxCount: 1 }
    ]), userControler.uploadDocuments);
export default userRouter;