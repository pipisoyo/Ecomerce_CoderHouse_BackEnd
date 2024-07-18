/**
 * Data Transfer Object (DTO) para representar un carrito de compras.
 */

/**
 * Clase que gestiona las operaciones relacionadas con los productos.
 * @class CartDTO
 */
export default class CartDTO {
    constructor({ _id , products }) {
        // Validación de datos
        if (typeof _id !== 'string' || !Array.isArray(products)) {
            throw new Error('Los datos proporcionados no son válidos');
        }

        // Manejo de valores nulos o por defecto
        this._id = _id || '';
        this.products = products || [];

        // Inmutabilidad
        Object.freeze(this);
    }
}