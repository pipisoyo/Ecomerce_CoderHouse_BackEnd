import * as chai from 'chai';
import supertest from 'supertest';
import userModel from '../src/dao/models/users.js';
import mongoose from 'mongoose';
import config from '../src/config.js';
import cartsModel from '../src/dao/models/carts.js';
import * as _ from 'mongoose-paginate-v2';

const URL = config.url
const DB_URL = config.mongo_url;
const adminUser = config.adminUser
const adminPassword = config.adminPassword
const connetion = mongoose.connect(DB_URL, { dbName: 'ecommerce' })

const requester = supertest(URL);
const agent =  supertest.agent(URL);
const expect = chai.expect;


describe('Testing Ecomerce-', () => {
    let userData;
    const mockUser = {
        first_name: "test",
        last_name: "superTest",
        email: "test@test.com",
        age: 100,
        password: "test"
    };

    const productMock = {
        title: 'Nuevo Producto Test',
        description: 'Descripción del Nuevo Producto Test',
        price: 99.99,
        code: 'Test',
        stock: 10,
        status: true,
        category: 'Test',
        thumbnails: ['image1.jpg', 'image2.jpg']
    };
    
    describe('Test de Sesiones', () => {
        

        before(async function() {
            const existingUser = await userModel.findOne({ email: mockUser.email });

            if (existingUser) {
                // Eliminar el usuario existente y su carrito de la base de datos
                await userModel.findByIdAndDelete(existingUser._id);
                if (existingUser.cart) {
                    await cartsModel.findByIdAndDelete(existingUser.cart._id);
                }
            }
        });

        it('El endpoint /failregister debe retornar una respuesta adecuada', async () => {

            const response = await agent.get('/api/sessions/failregister');

            expect(response.statusCode).to.equal(400);
            expect(response.body).to.deep.equal({ success: false, message: 'Falló el registro' });

        });

        it('El endpoint api/sessions/register debe registrar un usuario correctamente y asignarle un carrito', async () => {

            const {statusCode, _body} = await requester.post('/api/sessions/register').send(mockUser);
            userData = _body.data

            expect(statusCode).to.equal(201);
            expect(_body.success).to.be.true; 
            expect(_body.message).to.equal('Usuario registrado exitosamente'); 
            expect(_body.data).to.have.property('first_name', 'test'); 
            expect(_body.data).to.have.property('email', 'test@test.com');
            expect(_body.data).to.have.property('cart');
        });

        it('El endpoint /faillogin debe retornar una respuesta adecuada en caso de fallo en el inicio de sesión', async () => {

            const response = await agent.get('/api/sessions/faillogin');
        
            expect(response.statusCode).to.equal(400);
            expect(response.body).to.deep.equal({ success: false, message: 'Fallo en el inicio de sesión' });
        });

        it('El endpoint /login debe iniciar sesión de usuario correctamente', async () => {
            const { statusCode, _body } =  await agent.post('/api/sessions/login').send({
                email: mockUser.email,
                password: mockUser.password
            });
            
            expect(statusCode).to.equal(200);
            expect(_body.success).to.be.true;
            expect(_body.statusCode).to.equal(200);
            expect(_body.message).to.equal('Inicio de sesión exitoso');
            
            // Verificar los datos del usuario que ha iniciado sesión
            const userData = _body.data.user;
            expect(userData).to.have.property('first_name', 'test');
            expect(userData).to.have.property('email', 'test@test.com');
            expect(userData).to.have.property('role', 'user');
        });

        it('El endpoint /current debe devolver el usuario actual autenticado', async () => {

            const response = await agent.get('/api/sessions/current');
            
            expect(response.statusCode).to.equal(200);
            expect(response.body.success).to.be.true;
            expect(response.body.message).to.equal('Usuario autenticado');
            expect(response.body.data.user).to.exist;
            expect(response.body.data.user.first_name).to.equal('test');
            expect(response.body.data.user.email).to.equal('test@test.com');
            expect(response.body.data.user.role).to.equal('user');
        });

        it('El endpoint /premium/:uid debe cambiar el rol del usuario correctamente', async () => {

            const userId = userData._id;
            const response = await agent.put(`/api/sessions/premium/${userId}`);
        
            expect(response.statusCode).to.equal(200);
            expect(response.body.success).to.equal(true);
        
            // Verificar que el rol del usuario se haya actualizado correctamente en la base de datos
            const updatedUser = await userModel.findById(userId);
            expect(updatedUser.role).to.equal('premium');

        });

        it('El endpoint /api/sessions/logout debe cerrar una sesión existente', async () => {
    
            const logoutResponse = await agent.post('/api/sessions/logout');

            // Verificar el cierre de sesión
            expect(logoutResponse.statusCode).to.equal(200);
            expect(logoutResponse.body.success).to.be.true;
            expect(logoutResponse.body.message).to.equal('Sesión cerrada exitosamente');
        
        });

        after(async function() {
            if (userData) {
                const userId = userData._id;
                const cartId = userData.cart._id;
        
                // Eliminar el usuario y su carrito de la base de datos
                await userModel.findByIdAndDelete(userId);
                await cartsModel.findByIdAndDelete(cartId);
        
                // Verificar que el usuario y el carrito se hayan eliminado correctamente
                const deletedUser = await userModel.findById(userId);
                const deletedCart = await cartsModel.findById(cartId);
        
                expect(deletedUser).to.be.null; 
                expect(deletedCart).to.be.null; 
            }
        });
    });

    describe('Test de Productos', () => {
        let pid;
        before(async function() {
            const {statusCode} =await agent.post('/api/sessions/login').send({
                email: adminUser,
                password: adminPassword
            });
            expect(statusCode).to.equal(200);
        });

        it('El endpoint /products debe recuperar todos los productos correctamente', async () => {

            const response = await agent.get('/api/products');
        
            expect(response.statusCode).to.equal(200);
            expect(response.body.status).to.equal('success');
            expect(response.body.payload.result).to.be.an('array').that.is.not.empty;

        });

        it('El endpoint /products (POST) debe agregar un producto correctamente', async () => {

            const response = await agent.post('/api/products').send(productMock);
            pid= response._body.payload._id;

            expect(response.statusCode).to.equal(201);
            expect(response.status).to.equal(201); 
            expect(response.ok).to.be.true;
            expect(response.body).to.have.property('payload');
            expect(response.body.payload.title).to.equal('Nuevo Producto Test');
            expect(response.body.payload.price).to.equal(99.99);
            
        });

        it('El endpoint /products (PUT) debe actualizar un producto correctamente', async () => {

            const updatedProductData = {
                title: 'Actualizacion Producto Test',
                description: 'Descripción de la Actualizacion Producto Test',
                price: 100,
                code: 'Test Actualizacion',
                stock: 100,
                status: true,
                category: 'Test',
                thumbnails: ['image1.jpg', 'image2.jpg'],
                owner : "admin"
                
            };

            const response = await agent.put(`/api/products/${pid}`).send(updatedProductData);

            expect(response.statusCode).to.equal(201);
            expect(response.status).to.equal(201); 
            expect(response.body.status).to.equal("success");
            expect(response.body.payload).to.exist; 
            expect(response.body.payload.acknowledged).to.be.true; 
        
        });

        it('El endpoint /products (DELETE) debe eliminar un producto correctamente', async () => {
            
            const response = await agent.delete(`/api/products/${pid}`);
        
            expect(response.statusCode).to.equal(201);
            expect(response.body.status).to.equal('success');
            expect(response.body.payload).to.exist; 
            expect(response.body.payload.acknowledged).to.be.true; // Verificar que el producto fue eliminado con éxito

            const productResponse = await agent.get(`/api/products/${pid}`);

            expect(productResponse.statusCode).to.equal(404); // Verificar que el producto ya no se encuentra
        });

        after(async function() {
            // Cerrar sesión
            const logoutResponse = await agent.post('/api/sessions/logout');
            expect(logoutResponse.statusCode).to.equal(200);
            expect(logoutResponse._body.success).to.equal(true);
        });

    });

    describe('Test de Carrito', () => {
        let cartId;
        
        let pid;
        before(async function() {
            const {statusCode} =await agent.post('/api/sessions/login').send({
                email: adminUser,
                password: adminPassword
            });
            expect(statusCode).to.equal(200);

            const response = await agent.post('/api/products').send(productMock);
            pid= response._body.payload._id;
            expect(response.statusCode).to.equal(201);
            
        });
    
        it('El endpoint /cart debe crear un nuevo carrito correctamente', async () => {

            const response = await agent.post('/api/carts');
            cartId = response._body.data._id;
            
            expect(response.statusCode).to.equal(201);
            expect(response.body).to.have.property('success').equal(true);
            expect(response.body).to.have.property('message').equal('Carrito creado exitosamente');
            expect(response.body).to.have.property('data').to.exist; 
            expect(response.body.data).to.be.an('object');
            expect(response.body.data).to.have.property('_id');
            expect(response.body.data).to.have.property('products').to.be.an('array');
            
        });

        it('El endpoint /cart/:cid debe obtener un carrito por su ID correctamente', async () => {

            const response = await agent.get(`/api/carts/${cartId}`);
            
            expect(response.statusCode).to.equal(200);
            expect(response.body).to.have.property('success').equal(true);
            expect(response.body).to.have.property('message').equal('Carrito recuperado exitosamente');
            expect(response.body).to.have.property('data').to.exist;
            expect(response.body.data).to.be.an('object'); 
            expect(response.body.data).to.have.property('_id').equal(cartId); 
            expect(response.body.data).to.have.property('products').to.be.an('array'); 
            expect(response.body.data).to.have.property('__v').equal(0); 

        });

        it('El endpoint /cart/:cid/product/:pid debe agregar un producto al carrito correctamente', async () => {
            const response = await agent.post(`/api/carts/${cartId}/product/${pid}`)
            
            expect(response.statusCode).to.equal(201);
            expect(response.body).to.have.property('success').equal(true);
            expect(response.body.message).to.equal('Producto agregado al carrito');
        
            // Verificar que el producto se haya agregado al carrito correctamente
            const cartResponse = await agent.get(`/api/carts/${cartId}`);
            expect(cartResponse.statusCode).to.equal(200);
            expect(cartResponse.body).to.have.property('success').equal(true);
            expect(cartResponse.body.message).to.equal('Carrito recuperado exitosamente');

            const productsInCart = cartResponse.body.data.products;
            const addedProduct = productsInCart.find(product => product.product._id === pid);
            
            // Verificar que el producto agregado está presente en la lista de productos del carrito
            expect(addedProduct).to.exist; 
        });

        it('El endpoint /cart/:cid/products/:pid debe actualizar la cantidad de un producto en el carrito correctamente', async () => {
            const newQuantity = 2; 
            const response = await agent.put(`/api/carts/${cartId}/products/${pid}`).send({ quantity: newQuantity });
        
            expect(response.statusCode).to.equal(200);
            expect(response.body).to.have.property('success').equal(true);
            expect(response.body.message).to.equal('Cantidad de producto actualizada');
        
            // Verificar que la cantidad del producto se haya actualizado correctamente en el carrito
            const cartResponse = await agent.get(`/api/carts/${cartId}`);
            const updatedProduct = cartResponse.body.data.products.find(product => product.product._id === pid);
        
            expect(updatedProduct).to.exist; // Verificar que el producto actualizado existe en la lista de productos del carrito
            expect(updatedProduct.quantity).to.equal(newQuantity); // Verificar que la cantidad del producto actualizada sea la esperada
        });

        it('El endpoint /cart/:cid/purchase debe completar la compra de un carrito correctamente', async () => {
            //Cerrar Sesion admin
            const logoutResponse = await agent.post('/api/sessions/logout');
            expect(logoutResponse.statusCode).to.equal(200);
            //Registrar Usuario 
            const registerResponse = await requester.post('/api/sessions/register').send(mockUser);
            userData = registerResponse._body.data;
            expect(registerResponse.statusCode).to.equal(201);

            // Logear Usuario
            const loginResponse = await agent.post('/api/sessions/login').send({
                email: mockUser.email,
                password: mockUser.password
            });
            expect(loginResponse.statusCode).to.equal(200);

            const response = await agent.post(`/api/carts/${cartId}/purchase`);
            
            expect(response.statusCode).to.be.oneOf([200, 207]); // Verificar que el código de estado es el esperado (éxito o parcialmente exitoso)
        
            if (response.statusCode === 200) {
                // Verificar una compra exitosa
                expect(response.body).to.have.property('success').equal(true);
                expect(response.body.message).to.equal('Compra realizada exitosamente');
                expect(response.body).to.have.property('data'); // Verificar que se devuelve información del ticket de compra
                expect(response.body.data).to.have.property('code');
                expect(response.body.data).to.have.property('purchase_datetime');
                expect(response.body.data).to.have.property('amount');
                expect(response.body.data).to.have.property('purchaser');
            } else if (response.statusCode === 207) {
                // Verificar una compra parcialmente exitosa
                expect(response.body).to.have.property('success').equal(true);
                expect(response.body.message).to.equal('Algunos productos no se pudieron procesar');
                expect(response.body).to.have.property('data'); // Verificar que se devuelve información de los productos no procesados
                expect(response.body.data).to.have.property('productsNotPurchased');
                expect(response.body.data).to.have.property('newTicket');
            }
        });
        
        after(async function() {
            // Eliminar el carrito creado al finalizar las pruebas
            if (cartId) {
                const deleteResponse = await agent.delete(`/api/cart/${cartId}`);
                const verifyResponse = await agent.get(`/api/cart/${cartId}`);
                expect(verifyResponse.statusCode).to.equal(404);

            }
            
            //Eliminar producto creado al finañizar las pruebas
                //Iniciar secion como admin
                const {statusCode} =await agent.post('/api/sessions/login').send({
                    email: adminUser,
                    password: adminPassword
                });

                    //Eliminar producto
                    const response = await agent.delete(`/api/products/${pid}`)
                    expect(response.statusCode).to.equal(201);

            //Cerrar Sesion    
            const logoutResponse = await agent.post('/api/sessions/logout');
            expect(logoutResponse.statusCode).to.equal(200);
            expect(statusCode).to.equal(200);
        
        });
    });

});