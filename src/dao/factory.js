import AppConfig from '../config.js';
import mongoose from 'mongoose';

// Variables para almacenar las clases de gestión de productos y carritos
export let Products;
export let Carts;

// URL de la base de datos y tipo de persistencia obtenidos de la configuración
const DB_URL = AppConfig.mongo_url;
const persistence = AppConfig.persistence;

// Selección de la persistencia de datos
switch (persistence) {
    case "MONGO":
        // Conexión a la base de datos MongoDB
        const connection = async () => {
            const dataBase = 'ecommerce';
            try {
                await mongoose.connect(DB_URL, { dbName: dataBase });
                console.log("Conectado a la base de datos 'ecommerce'");
            } catch (error) {
                console.error("No se pudo conectar a la base de datos", error);
                process.exit();
            }
        };

        // Importación de las clases de gestión de productos y carritos para MongoDB
        const { default: ProductsMongo } = await import("./mongo/products.mongo.js");
        Products = ProductsMongo;

        const { default: CartsMongo } = await import("./mongo/carts.mongo.js");
        Carts = CartsMongo;
        break;
    case "MEMORY":
        // Importación de las clases de gestión de productos y carritos para memoria
        const { default: ProductsMemory } = await import("./memory/products.memory.js");
        Products = ProductsMemory;

        const { default: CartsMemory } = await import("./memory/carts.memory.js");
        Carts = CartsMemory;
        break;
    default:
        break;
}