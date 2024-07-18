// @ts-nocheck
import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Clase que gestiona las operaciones relacionadas con los carritos de compras a nivel local.
 */
class CartsManager {
    constructor() {
        this.carts = [];
        this.PATH = `${__dirname}/data/carts.json`;
    }

    /**
     * Maneja la lectura de datos desde el archivo JSON.
     * @returns {Array} Array de carritos.
     */
    async handleData() {
        try {
            let data = await fs.promises.readFile(this.PATH, 'utf-8');
            if (data) {
                this.carts = JSON.parse(data);
            }
        } catch (error) {
            if (error.code === 'ENOENT') {
                await fs.promises.writeFile(this.PATH, JSON.stringify([]), { encoding: 'utf-8', flag: 'w' });
                this.carts = [];
                return this.carts;
            } else {
                throw new Error("Error al cargar los datos");
            }
        }
    }

    /**
     * Guarda los datos en el archivo JSON.
     */
    async saveData() {
        try {
            await fs.promises.writeFile(this.PATH, JSON.stringify(this.carts, null, 2), { encoding: 'utf-8', flag: 'w' });
        } catch (error) {
            throw new Error("Error al guardar los datos");
        }
    }

    /**
     * Crea un nuevo carrito.
     * @returns {object} El nuevo carrito creado.
     */
    async createCart() {
        await this.handleData();

        const newCart = {
            _id: new mongoose.Types.ObjectId(),
            products: [],
        };

        this.carts.push(newCart);
        await this.saveData();

        return newCart;
    }

    /**
     * Obtiene un carrito por su ID.
     * @param {string} id - ID del carrito a buscar.
     * @returns {object} El carrito encontrado o un objeto de error.
     */
    async getCartById(id) {
        await this.handleData();
        const cart = this.carts.find(cart => cart._id.toString() === id);
        if (cart) {
            return cart;
        } else {
            return { error: "El carrito no existe", statusCode: 404 };
        }
    }

    /**
     * Agrega un producto a un carrito.
     * @param {string} cartId - ID del carrito.
     * @param {string} productId - ID del producto a agregar.
     * @returns {object} El carrito actualizado con el producto agregado.
     */
    async addProduct(cartId, productId) {
        await this.handleData();

        const cart = this.carts.find(cart => cart._id.toString() === cartId);
        if (!cart) {
            throw new Error("Carrito no encontrado");
        }

        const existingProduct = cart.products.find(product => product.product.toString() === productId);
        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            const newProduct = {
                product: new mongoose.Types.ObjectId(productId),
                quantity: 1,
            };
            cart.products.push(newProduct);
        }

        await this.saveData();

        return cart;
    }

/**
     * Elimina un producto de un carrito.
     * @param {string} cartId - ID del carrito.
     * @param {string} productId - ID del producto a eliminar.
     * @returns {object} El carrito actualizado sin el producto eliminado.
     */
async deleteProduct(cartId, productId) {
        await this.handleData();

        const cart = this.carts.find(cart => cart._id.toString() === cartId);
        if (!cart) {
            throw new Error("Carrito no encontrado");
        }

        const productIndex = cart.products.findIndex(product => product.product.toString() === productId);
        if (productIndex !== -1) {
            cart.products.splice(productIndex, 1);
            await this.saveData();
        } else {
            throw new Error("Producto no encontrado en el carrito");
        }

        return cart;
    }
    
  /**
     * Actualiza la cantidad de un producto en un carrito.
     * @param {string} cartId - ID del carrito.
     * @param {string} productId - ID del producto.
     * @param {number} newQuantity - Nueva cantidad del producto.
     * @returns {object} El carrito actualizado con la cantidad del producto modificada.
     */
    async updateQuantity(cartId, productId, newQuantity) {
        await this.handleData();

        const cart = this.carts.find(cart => cart._id.toString() === cartId);
        if (!cart) {
            throw new Error("Carrito no encontrado");
        }

        const existingProduct = cart.products.find(product => product.product.toString() === productId);
        if (existingProduct) {
            existingProduct.quantity = newQuantity;
            await this.saveData();
            return cart;
        } else {
            throw new Error("Producto no encontrado en el carrito");
        }
    }
}

export default CartsManager;