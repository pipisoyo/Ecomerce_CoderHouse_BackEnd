import mongoose from "mongoose";

const collection = "tickets"
// Definir el esquema del modelo Ticket
const ticketSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    purchase_datetime: {
        type: Date,
        default: Date.now
    },
    amount: {
        type: Number,
        required: true
    },
    purchaser: {
        type: String,
        required: true
    },
    productsToPurchase : [{
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

// Crear el modelo Ticket basado en el esquema definido
const ticketModel = mongoose.model(collection, ticketSchema);


export default ticketModel