import mongoose, { Schema } from "mongoose";

// Nombre de la colección en la base de datos
const collection = "Messages";

// Definición del esquema de la colección "Messages"
const schema = new Schema({
    email: {
        type: String
    },
    message: {
        type: String
    }
});

// Modelo de mongoose para la colección "Messages" basado en el esquema definido
const messagesModel = mongoose.model(collection, schema);

export default messagesModel;