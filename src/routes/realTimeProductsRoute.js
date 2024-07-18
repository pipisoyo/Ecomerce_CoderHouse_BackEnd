import { Router } from 'express';
import {Products} from "../dao/factory.js";
import { auth } from '../config/auth.js';

const realTimeProducts = Router();
const productManager = new Products();

/**
 * Ruta para obtener la lista de productos en tiempo real.
 * @name GET /real-time-products
 * @function
 */
realTimeProducts.get('/', auth, async (req, res) => {
  try {
    const products = await productManager.getAll();

    res.render('realTimeProducts', { products: products.result });
  } catch (error) {
    console.error('Error al obtener la lista de productos:', error);
    res.status(500).send('Error al obtener la lista de productos');
  }
});

/**
 * Exporta el enrutador de las RealTime.
 * @module realTimeProducts
 */

export default realTimeProducts;
