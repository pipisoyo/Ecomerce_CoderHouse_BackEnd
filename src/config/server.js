import express from "express";
import mongoose from "mongoose";
import { Server } from 'socket.io';
import config from "../config.js";

const app = express();
const PORT = config.port ||8080
const DB_URL = config.mongo_url;

/**
 * Conecta a la base de datos MongoDB.
 */
export const connectMongoDB = async () => {
  const dataBase = 'ecommerce';
  try {
    await mongoose.connect(DB_URL, { dbName: dataBase });
    console.log("Conectado a la base de datos 'ecommerce'");
  } catch (error) {
    console.error("No se pudo conectar a la base de datos", error);
    process.exit();
  }
}

connectMongoDB();

const server = app.listen(PORT, () => console.log("Servidor escuchando en", PORT));
const io = new Server(server);

/**
 * Exporta la aplicación Express y el servidor de Socket.IO.
 */
export { app, io };