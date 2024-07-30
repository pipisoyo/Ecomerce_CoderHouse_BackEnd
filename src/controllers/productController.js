import { io } from '../config/server.js';
import responses from "../config/responses.js";
import { productsService } from "../repositories/index.js";
import { CustomError } from "../utils/customError.js";
import { errorTypes } from "../utils/errorTypes.js"
import { validarProducto } from "../utils/producstErros.js";
import { addLogger } from '../utils/logger.js';
import { sendMailProductDelete } from '../utils/mailing.js';


/**
 * Controlador para la gestión de productos.
 */
class productController {

    /**
     * Recupera todos los productos con opciones de filtrado y paginación.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    async getAll (req, res) {
        addLogger(req, res, async () => {
            req.logger.debug('Recuperando todos los productos');

            try {
                const result = await productsService.getAll();
                req.logger.info('Productos recuperados con éxito');

                res.status(200).send({ status: "success", payload: result });

                return result;
            } catch (error) {
                req.logger.error('Error al recuperar los productos: ' + error.message);

                res.status(500).send({ status: "error", message: "Error al recuperar los productos" });
            }
        });
    }


    /**
     * Recupera un producto por su ID.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    async getById (req, res) {
        addLogger(req, res, async () => {
            req.logger.info('Recuperando producto por ID');

            try {
                const id = req.params._id;
                const result = await productsService.getById(id);

                if (!result) {
                    req.logger.warn('Producto no encontrado');
                    res.status(404).send({ status: "error", message: "Producto no encontrado" });
                    return;
                }

                req.logger.info('Producto recuperado con éxito');
                res.status(200).send({ status: "success", payload: result });
            } catch (error) {
                req.logger.error('Error al recuperar el producto: ' + error.message);
                res.status(500).send({ status: "error", message: "Error al recuperar el producto" });
            }
        });
    }

    /**
     * Agrega un nuevo producto.
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    async addProduct (req, res) {
        addLogger(req, res, async () => {
            let userRole = req.session.user.role;
            console.log("🚀 ~ addLogger ~ userRole:", userRole)
            let owner = "admin"
            if ( userRole == "premiun") {
                owner=req.session.user.email
                }
            let product = Object.keys(req.body)
            let productKeys = ["title", "description", "price", "code", "stock", "status", "category", "thumbnails"]
            let invalidKeys = productKeys.filter(key => !product.includes(key)).map(key => ({
                key,
                index: productKeys.indexOf(key),
                value: product[productKeys.indexOf(key)] || 'No ingresado'
            }));
            let { title, description, price, code, stock, status, category, thumbnails} = req.body;

            if (invalidKeys.length > 0) {
                throw CustomError.CustomError(
                    `Missing Data`,
                    `Enter the property ${invalidKeys[0].key}`,
                    errorTypes.ERROR_ARGUMENTOS_INVALIDOS,
                    validarProducto(invalidKeys[0])
                )
            }

            Promise.resolve(productsService.addProduct({ title, description, price, code, stock, status, category, thumbnails, owner }))
                .then(result => {
                    if (!result) {
                        req.logger.error('Error al agregar el producto');
                        res.status(500).send({ status: "error", message: "Error al agregar el producto" });
                        return;
                    }

                    req.logger.info('Producto agregado exitosamente');
                    res.setHeader("Content-Type", "application/json");
                    return res.status(201).json({ payload: result });
                })
                .catch(error => {
                    req.logger.error('Error al agregar el producto: ' + error.message);
                    res.status(500).send({ status: "error", message: "Error al agregar el producto" });
                });
        });

    }


    /**
  * Inserta un nuevo documento de producto.
  * @param {object} req - Objeto de solicitud.
  * @param {object} res - Objeto de respuesta.
  */
    async insertDocument (req, res) {
        addLogger(req, res, async () => {
            req.logger.info('Insertando nuevo documento de producto');

            try {
                const product = req.body;
                let result = await productsService.insertDocument(product);

                req.logger.info('Documento insertado exitosamente');
                let data = await productsService.getAll();
                io.emit('products', data.result);

                responses.successResponse(res, 201, "Documentos insertados exitosamente", result);
            } catch (error) {
                req.logger.error('Error al insertar el documento: ' + error.message);
                responses.errorResponse(res, 500, "Error al insertar el documento");
            }
        });
    }

    /**
 * Actualiza un producto de forma sincrónica.
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 */
    async updateProduct (req, res) {
        addLogger(req, res, async () => {
            req.logger.info('Actualizando un producto');

            try {
                const id = req.params._id;
                const productData = req.body;
                const result = await productsService.updateProduct(id, productData);
                let data = await productsService.getAll();

                if (result) {
                    io.emit('products', data.result);
                    req.logger.info('Producto actualizado con éxito');
                    res.status(201).send({ status: "success", payload: result });
                } else {
                    req.logger.warn('Producto no encontrado');
                    res.status(404).send({ error: "Product not found" });
                }
            } catch (error) {
                req.logger.error('Error al actualizar el producto: ' + error.message);
                res.status(500).send({ error: "An error occurred while updating the product" });
            }
        });
    }

    /**
  * Elimina un producto de forma sincrónica.
  * @param {Object} req - Objeto de solicitud HTTP.
  * @param {Object} res - Objeto de respuesta HTTP.
  */
    async deleteProduct (req, res) {
        addLogger(req, res, async () => {
            req.logger.info('Eliminando un producto');
            let userEmail = req.session.user.email;
            let userRole = req.session.user.role;
            let userName = req.session.user.first_name;
            try {
                const id = req.params._id;
                let product = await productsService.getById(id);

                if (!product){
                    req.logger.warn('Producto no encontrado');
                    return res.status(404).send({ error: "Producto no encontrado" });
                }
                
                if (product.owner !== userEmail && userRole!== 'admin') {
                    req.logger.warn('No puede borrar productos que usted no creó');
                    return res.status(403).send({ error: "No tiene permiso para eliminar este producto" });
                }
    
                const result = await productsService.deleteProduct(id);
                const data = await productsService.getAll();
    
                if (result) {
                    sendMailProductDelete(userEmail,userName,product.title)
                    req.logger.info('Producto eliminado con éxito');
                    io.emit('products', data.result);
                    return res.status(201).send({ status: "success", payload: result });
                } else {
                    req.logger.warn('Producto no encontrado');
                    return res.status(404).send({ error: "Producto no encontrado" });
                }
            } catch (error) {
                req.logger.error('Error al eliminar el producto: ' + error.message);
                return res.status(500).send({ error: "Ocurrió un error al eliminar el producto" });
            }
        });
    }

    /**
  * Vista en tiempo real.
  * @param {Object} req - Objeto de solicitud HTTP.
  * @param {Object} res - Objeto de respuesta HTTP.
  */
    async realTime (req, res) {
        addLogger(req, res, async () => {
            req.logger.info('Obteniendo la lista de productos en tiempo real');
            try {
                const products = await productsService.getAll();
                req.logger.info('Lista de productos obtenida con éxito');
                res.render('realTimeProducts', { products: products.result });
            } catch (error) {
                req.logger.error('Error al obtener la lista de productos en tiempo real: ' + error.message);
                res.status(500).send('Error al obtener la lista de productos');
            }
        });
    }

};

export default new productController;