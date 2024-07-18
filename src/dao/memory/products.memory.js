import fs from 'fs';
import __dirname from '../../utils/utils.js';
import mongoose from 'mongoose';


/**
 * Clase que gestiona la manipulación de productos almacenados localmente en un archivo JSON.
 */
class Products {
    /**
     * Constructor de la clase localProductManager.
     */
    constructor() {
        /**
         * @type {Array<object>} 
         */
        this.products = [];
        /**
         * @type {number} 
         */
        this.idCounter = 0;
        /**
         * @type {string}
         */
        this.PATH = `${__dirname}/dao/memory/data/products.json`;
    }

    /**
     * Carga los datos de productos desde el archivo JSON.
     * @returns {Promise<void>} 
     */
    async handleData() {
        try {
            let data = await fs.promises.readFile(this.PATH, 'utf-8');
           

            if (data) {
                this.products = JSON.parse(data);
                const lastProductId = this.products.reduce((maxId, product) => Math.max(maxId, product.id), 0);
                this.idCounter = lastProductId;
            }
            
        } catch (error) {
            if (error.code === 'ENOENT') {
                await fs.promises.writeFile(this.PATH, JSON.stringify(''), null, 2);
                this.products = [];
                return this.products;
            } else {
                throw new Error("Error al cargar los datos");
            }
        }
    }

    /**
     * Guarda los datos de productos en el archivo JSON.
     * @returns {Promise<void>} 
     */
    async saveData() {
        try {
            await fs.promises.writeFile(this.PATH, JSON.stringify(this.products), null, 2);
        } catch (error) {
            throw new Error("Error al guardar los datos");
        }
    }

    /**
     * Agrega un nuevo producto a la lista de productos.
     * @param {object} productData - Datos del nuevo producto a agregar.
     * @returns {Promise<void>} - Promesa que maneja la adición del producto.
     */
    async addProduct(productData) {
        await this.handleData();

        if (!this.products.some(product => product.code === productData.code)) {
            const newProduct = {
                _id: new mongoose.Types.ObjectId(),
                title: productData.title,
                description: productData.description,
                price: productData.price,
                code: productData.code,
                stock: productData.stock,
                status:productData.status,
                category:productData.category,
                thumbnails: productData.thumbnails,
                
                
            };
            this.products.push(newProduct);
            this.idCounter++;
            await this.saveData();
        } else {
            throw new Error("Error al agregar el producto");
        }
    }

   /**
 * Obtiene todos los productos.
 * @returns {Promise<object>} - Objeto con la lista de productos y el número total de páginas.
 */
   async getAll(limit = 10, page = 1, sortOption, filter) {
    await this.handleData();
    
    // Calcular el índice de inicio y fin para la paginación
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Obtener los productos dentro del límite y la página especificados
    const paginatedProducts = this.products.slice(startIndex, endIndex);

    return { result: paginatedProducts, totalCount: this.products.length, currentPage: page };
}
        

    /**
     * Obtiene un producto por su ID.
     * @param {number} id - ID del producto a buscar.
     * @returns {Promise<object>} - Producto encontrado.
     */
    async getById(id) {
        await this.handleData();
        const product = this.products.find(product => product._id == id);
        if (product) {
            return product;
        } else {
            throw new Error("El producto no existe");
        }
    }

    /**
     * Actualiza un producto por su ID con nuevos datos.
     * @param {number} id - ID del producto a actualizar.
     * @param {object} newProductData - Nuevos datos del producto.
     * @returns {Promise<boolean>} - Indicador de éxito de la actualización.
     */
    async updateProduct(id, newProductData) {
        console.log("🚀 ~ Products ~ updateProduct ~ newProductData:", newProductData)
        await this.handleData();

        const product = this.products.find(product => {
            console.log("🚀 ~ Products ~ updateProduct ~ product:", product)
            return product._id == id
        })
        if (product) {
            if (newProductData.hasOwnProperty('id')) {
                throw new Error("No se permite modificar el ID del producto.");
            }

            const updatedProduct = {
                ...product,
                ...newProductData
            };
            const index = this.products.indexOf(product);
            this.products[index] = updatedProduct;
            this.saveData();
            return true;
        } else {
            return false;
        }
    }

    /**
     * Elimina un producto por su ID.
     * @param {number} id - ID del producto a eliminar.
     * @returns {Promise<object|null>} - Producto eliminado o nulo si no se encuentra.
     */
    async deleteProduct(id) {
        await this.handleData();
        const productIndex = this.products.findIndex(product => product.id == id);
        if (productIndex === -1) {
            return null;
        }

        const deletedProduct = this.products.splice(productIndex, 1)[0];
        await this.saveData();

        return deletedProduct;
    }

    /**
 * Agrega múltiples productos a la lista de productos.
 * @param {Array<object>} products - Array de objetos que contienen los datos de los productos a agregar.
 * @returns {Promise<void>} - Promesa que maneja la adición de los productos.
 */
async insertDocument(products) {
    await this.handleData();

    products.forEach(productData => {
        if (!this.products.some(product => product.code === productData.code)) {
            const newProduct = {
                _id: new ObjectId(),
                title: productData.title,
                description: productData.description,
                price: productData.price,
                code: productData.code,
                stock: productData.stock,
                status: productData.status,
                category: productData.category,
                thumbnails: productData.thumbnails,
            };
            this.products.push(newProduct);
            this.idCounter++;
        } else {
            throw new Error("Error al agregar uno de los productos, código duplicado.");
        }
    });

    await this.saveData();
}
}

export default Products

