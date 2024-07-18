import mongoose from "mongoose";

// Nombre de la colección en la base de datos
const collection = "carts";

// Definición del esquema de la colección "carts"
const schema = new mongoose.Schema({
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "products",
            required: true
        },
        quantity: {
            type: Number,
            required: true
        }
    }]
});

// Modelo de mongoose para la colección "carts" basado en el esquema definido
const cartsModel = mongoose.model(collection, schema);

export default cartsModel;