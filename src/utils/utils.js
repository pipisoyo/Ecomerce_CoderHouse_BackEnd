import bcrypt from 'bcrypt'
import nodemailer from "nodemailer";
import config from '../config.js';
import ticketModel from '../dao/models/tickets.js';
import { fakerES as faker } from '@faker-js/faker'
import ProductDTO from '../dao/DTOs/products.dto.js';
import multer from 'multer'



/**
 * Crea un hash a partir de una contraseña utilizando bcrypt.
 * @param {string} password - Contraseña a hashear.
 * @returns {string} - Hash de la contraseña.
 */
export const createHash = (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(10))

/**
 * Valida si una contraseña es válida para un usuario utilizando bcrypt.
 * @param {Object} user - Usuario con la contraseña a validar.
 * @param {string} password - Contraseña a verificar.
 * @returns {boolean} - true si la contraseña es válida, false si no lo es.
 */
export const isValidPassword = (user, password) => {
  return bcrypt.compareSync(password, user.password);
};

/**
 * Genera un código único basado en el ID del carrito y la fecha de compra.
 * @param {string} cartId - ID del carrito.
 * @param {Date} purchaseDatetime - Fecha de compra.
 * @returns {string} Código único generado.
 */
export function generateUniqueCode(cartId, purchaseDatetime) {
  // Combinar el ID del carrito y la fecha de compra en una cadena
  const combinedString = cartId.toString() + purchaseDatetime.toISOString();

  // Generar un hash único a partir de la cadena combinada
  function generateHash(data) {
    const saltRounds = 10;
    const hash = bcrypt.hashSync(data, saltRounds);
    return hash;
  }

  // Generar el hash único a partir de la cadena combinada
  const hashCode = generateHash(combinedString);
  const sanitizedCode = hashCode.replace(/\//g, '-');
  return sanitizedCode;

  // Devolver un código único basado en el hash generado
  return hashCode;
}

/**
 * Calcula el monto total de una lista de productos.
 * @param {Array} products - Lista de productos con precio.
 * @returns {number} Monto total calculado.
 */
export function calculateTotalAmount(products) {

  // Verificar si la lista de productos está vacía
  if (products.length === 0) {
    return 0;
  }

  // Calcular el monto total sumando los precios de los productos
  const totalAmount = products.reduce((total, product) => total + product.product.price * product.quantity, 0);



  return totalAmount;
}

/**
 * Opciones de configuración para enviar correos electrónicos.
 */
const mailOptions = {
  service: "gmail",
  host: "smtp.gmail.com",
  secure: false,
  port: 587,
  auth: {
    user: config.mail_username,
    pass: config.mail_password,
  },
};

/**
 * Función asincrónica para enviar un correo con los detalles de la compra.
 * @param {object} ticket - Información del ticket de compra.
 * @returns {string} Mensaje de confirmación del envío del correo.
 */
export async function sendMail(ticket) {
  const transport = nodemailer.createTransport(mailOptions);

  try {
    const res = await ticketModel.findOne({ code: ticket.code }).populate('productsToPurchase.product').lean().exec();
    let productsList = '';

    if (res && res.productsToPurchase) {
      const products = res.productsToPurchase.map(element => ({
        title: element.product.title,
        quantity: element.quantity
      }));

      products.forEach(product => {
        productsList += `<li>${product.title} - Cantidad: ${product.quantity}</li>`;
      });
    }


    const result = await transport.sendMail({
      from: `Correo de prueba <${ticket.purchaser}>`,
      to: ticket.purchaser,
      subject: "Detalle de la compra",
      html: `<div>
                <h1>CORREO TEST</h1>
                <h2>N° de Ticket: ${ticket.code}</h2>
                <p>Fecha de Compra: ${ticket.purchase_datetime}</p>
                <p>productos comprados:</p>
                <ul>
                    ${productsList}
                </ul>
                <h3>Total a Pagar: ${ticket.amount}</h3>
            </div>`,
    });

    return "Correo enviado";
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    throw error;
  }
}

/**
 * Genera una cantidad especificada de productos aleatorios.
 * @param {number} numOfProducts - Número de productos a generar.
 * @returns {object} Objeto con la lista de productos generados.
 */
export const generateProducts = (numOfProducts) => {
  let products = [];
  for (let i = 0; i < numOfProducts; i++) {
    let product = createProduct()
    products.push(createProduct())
  }

  return {
    products,
  };
};

/**
 * Crea un producto aleatorio con datos falsos.
 * @returns {object} Producto generado aleatoriamente.
 * @throws {Error} Si algún campo obligatorio está vacío.
 */
const createProduct = () => {
  try {
    const productData = {
      _id: faker.database.mongodbObjectId(),
      title: faker.commerce.productName(),
      description: faker.lorem.sentences(),
      price: parseFloat(faker.commerce.price()),
      code: faker.string.numeric({ length: 8 }),
      stock: parseInt(faker.string.numeric({ length: 3 })),
      status: faker.datatype.boolean(),
      category: faker.commerce.department(),
      thumbnails: [faker.image.url()],
      owner: "admin"
    };
    console.log("entro")
    const product = new ProductDTO(productData)

    // Verificar si algún campo obligatorio está vacío
    for (const key in product) {
      if (!product[key]) {
        throw new Error(`Falta el campo '${key}' en el producto`);
      }
    }

    return product; // Devolver el producto si todos los campos están presentes
  } catch (error) {
    throw new Error(`Error al crear el producto: ${error.message}`);
  }
};


