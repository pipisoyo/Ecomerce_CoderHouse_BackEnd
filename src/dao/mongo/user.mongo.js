import userModel from "../models/users.js";

class UserManager {

    async getAll() {
        try {
            return await userModel.find()
        } catch (error) {
            throw new Error ("Error al recuperar los usuarios")
        }
    }
}

export default UserManager