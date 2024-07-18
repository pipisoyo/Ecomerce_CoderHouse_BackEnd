/**
 * Función para validar un error al registrar un producto.
 * @param {object} productError - Objeto que contiene información sobre el error de registro del producto.
 * @returns {string} Mensaje de error detallado sobre el registro del producto.
 */
export const validarProducto = (productError) => {
  return `Error al registrar el producto.
  Se esperaba el siguiente argumento:
  - ${productError.key}: de tipo ${typeof(productError.key)} - se recibió: "${productError.value}"`;
};