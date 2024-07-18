import mongoose from 'mongoose';

// Nombre de la colección en la base de datos
const collection = 'users';

// Definición del esquema de la colección "users"
const schema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: String,
    age: Number,
    password: String,
    role: String,
    last_connection: Date, 
    status: String,
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "carts",
        required: true
    },
    documents:[{
        name: String,
        reference: String,
    }]
});

// Modelo de mongoose para la colección "users" basado en el esquema definido
const userModel = mongoose.model(collection, schema);

export default userModel;