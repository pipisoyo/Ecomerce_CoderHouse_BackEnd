import mongoose from 'mongoose';
// @ts-ignore
import mongoosePaginate from 'mongoose-paginate-v2';

// Nombre de la colección en la base de datos
const collection = "products";

// Definición del esquema de la colección "products"
const schema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    status: {
        type: Boolean,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    thumbnails: {
        type: [String],
        required: true
    },
    owner : {
        type: String,
        ref: "users",
        required: true
    }
});

// Agregar plugin de paginación a mongoose para el esquema
schema.plugin(mongoosePaginate);

// Modelo de mongoose para la colección "products" basado en el esquema definido
const productsModel = mongoose.model(collection, schema);

export default productsModel;