// @ts-nocheck
import { Router } from "express";
import { localProductManager } from "../dao/services/productManager.js/index.js";
import { io } from '../app.js';

const localRouterProducts = Router();
const productManager = new localProductManager();

/**
 * Ruta para obtener todos los productos o limitar la cantidad.
 * @name GET /products
 * @function
 */
localRouterProducts.get("/", async ({ query }, res) => {
  try {
    const { limit } = query;
    let products = await productManager.getProducts();

    if (limit) {
      products = products.slice(0, parseInt(limit));
    }
    res.render('home', { products: products });
  } catch (error) {
    console.error("Error al obtener los productos", error);
    res.status(500).send("Error al obtener los productos");
  }
});

/**
 * Ruta para obtener un producto por su ID.
 * @name GET /products/:pid
 * @function
 */
localRouterProducts.get("/:pid/", async (req, res) => {
  try {
    const { pid } = req.params;
    const product = await productManager.getProductById(pid);

    res.json(product);
  } catch (error) {
    console.error("Error al obtener el producto:", error);
    res.status(500).send("Error al obtener el producto");
  }
});

/**
 * Ruta para agregar un nuevo producto.
 * @name POST /products
 * @function
 */
localRouterProducts.post("/", async (req, res) => {
  try {
    const { title, description, code, price, stock, category, thumbnails } = req.body;

    const productData = {
      title,
      description,
      code,
      price,
      thumbnail: thumbnails || [],
      stock,
      category,
    };
    await productManager.addProduct(productData);

    const products = await productManager.getProducts();

    io.emit('products', products);
    res.status(201).json({ success: true, message: "Producto agregado exitosamente" });
  } catch (error) {
    console.error("Error al agregar el producto:", error);
    res.status(500).send("Error al agregar el producto");
  }
});

/**
 * Ruta para actualizar un producto por su ID.
 * @name PUT /products/:pid
 * @function
 */
localRouterProducts.put("/:pid", async (req, res) => {
  try {
    const { pid } = req.params;
    const updatedFields = req.body;

    try {
      const updateSuccess = await productManager.updateProduct(pid, updatedFields);

      if (updateSuccess) {
        res.send("Producto actualizado exitosamente");
        io.emit('products', await productManager.getProducts());
      } else {
        res.status(404).send("No se encontró el producto con el id " + pid);
      }
    } catch (error) {
      res.status(400).send(error.message);
    }
  } catch (error) {
    console.error("Error al actualizar el producto:", error);
    res.status(500).send("Error al actualizar el producto");
  }
});

/**
 * Ruta para eliminar un producto por su ID.
 * @name DELETE /products/:pid
 * @function
 */
localRouterProducts.delete("/:pid/", async (req, res) => {
  try {
    const { pid } = req.params;

    const product = await productManager.getProductById(pid);

    if (!product) {
      res.status(404).send("No se encontró el producto con el id " + pid);
      return;
    }

    const deletedProduct = await productManager.deleteProduct(pid);

    if (!deletedProduct) {
      res.status(500).send("Error al eliminar el producto");
      return;
    }

    res.send("Producto eliminado exitosamente");
    io.emit('products', await productManager.getProducts());
  } catch (error) {
    console.error("Error al eliminar el producto:", error);
    res.status(500).send("Error al eliminar el producto");
  }
});

export default localRouterProducts;