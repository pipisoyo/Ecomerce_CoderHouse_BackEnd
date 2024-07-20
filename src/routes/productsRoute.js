import express from "express";
import productController from "../controllers/productController.js";
import { authUser } from "../config/auth.js";
//import Products from "../dao/mongo/products.mongo.js";
//import { Products } from "../dao/memory/products.memory.js";

const productsRouter = express.Router();

/**
 * Ruta para obtener todos los productos.
 * @name GET /products
 * @function
 */
productsRouter.get("/", productController.getAll);

/**
 * Ruta para obtener un producto por su ID.
 * @name GET /products/:_id
 * @function
 */
productsRouter.get("/:_id", productController.getById);

/**
 * Ruta para agregar un nuevo producto.
 * @name POST /products
 * @function
 */
productsRouter.post("/", authUser(['admin','premiun']) , productController.addProduct);

/**
 * Ruta para insertar un documento.
 * @name POST /products/insert
 * @function
 */
productsRouter.post("/insert", authUser(['admin']), productController.insertDocument);

/**
 * Ruta para actualizar un producto por su ID.
 * @name PUT /products/:_id
 * @function
 */
productsRouter.put("/:_id", authUser(['admin']), productController.updateProduct);

/**
 * Ruta para eliminar un producto por su ID.
 * @name DELETE /products/:_id
 * @function
 */
productsRouter.delete("/:_id", authUser(['admin','premiun']), productController.deleteProduct );



/**
 * Exporta los enrutadores de las rutas Products.
 * @module productsRouter
 */
export default productsRouter;