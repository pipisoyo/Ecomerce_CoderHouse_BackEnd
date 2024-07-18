import response from '../config/responses.js';
import userModel from '../dao/models/users.js';
import UserManager from '../dao/mongo/user.mongo.js';
import { addLogger } from '../utils/logger.js';
import { __dirname } from '../config.js';
import fs from 'fs';

const users = new UserManager();

const userController = {
    getAll: async function(req, res) {
        addLogger(req, res, async function() {
            req.logger.info('obteniendo usuarios');
            try {
                const result = await users.getAll();
                const usersResponse = result.map(user => {
                    return {
                        first_name: user.first_name,
                        email: user.email,
                        role: user.role
                    };
                });
                req.logger.info('Usuarios recuperados');
                return response.successResponse(res, 200, "Usuarios recuperados con éxito", usersResponse);
            } catch (error) {
                req.logger.error("Error al recuperar los usuarios");
                return response.errorResponse(res, 500, "Error al recuperar los usuarios");
            }
        });
    },

    premiun: function(req, res) {
        addLogger(req, res, async function() {
            req.logger.info('Verificando información');
            const uid = req.params.uid;
            userModel.findById(uid).then(user => {
                if (!user) {
                    req.logger.error('No se encuentra el usuario');
                    return response.errorResponse(res, 404, 'No se encuentra el usuario');
                }

                if (user.role === "user") {
                    req.logger.debug('Verificando documentación requerida');
                    const requiredDocuments = ['identificacion', 'domicilio', 'cuenta'];
                    const userDocuments = user.documents.map(document => document.name);
                    if (requiredDocuments.some(doc => !userDocuments.includes(doc))) {
                        req.logger.error('Faltan documentos requeridos en la base de datos');
                        return response.errorResponse(res, 400, 'Faltan documentos requeridos en la base de datos para actualizar a premium');
                    }
                }

                let newRole = user.role === "premiun" ? "user" : "premiun";

                userModel.updateOne({ _id: uid }, { role: newRole }).then(() => {
                    req.logger.info(`Rol actualizado a ${newRole}`);
                    response.successResponse(res, 200, `Rol actualizado a ${newRole}, por favor vuelva a iniciar sesión`, null);
                    req.session.destroy();
                }).catch(err => {
                    req.logger.error('Error al actualizar el rol: ' + err.message);
                    response.errorResponse(res, 500, 'Error al actualizar el rol');
                });
            });
        });
    },

    uploadDocuments: async function(req, res) {
        const { uid } = req.params;
        const files = req.files;
        addLogger(req, res, async function() {
            try {
                const user = await userModel.findById(uid);
                if (!user) {
                    req.logger.error("Usuario no encontrado");
                    return response.errorResponse(res, 404, 'Usuario no encontrado');
                }
                Object.keys(files).forEach(field => {
                    const file = files[field][0];
                    const fieldname = file.filename;
                    const existingDocumentIndex = user.documents.findIndex(doc => doc.name === field);
                    if (existingDocumentIndex !== -1) {
                        const oldFilePath = user.documents[existingDocumentIndex].reference;
                        fs.unlinkSync(oldFilePath); // Eliminar el archivo anterior
                        user.documents[existingDocumentIndex].reference = file.path;
                        req.logger.info(`Documento ${field} actualizado correctamente`); // Sobrescribir el documento existente
                    } else {
                        user.documents.push({ name: field, reference: file.path });
                        req.logger.info("Documento cargado correctamente"); // Agregar nuevo documento
                    }
                });
                
                // Actualizar el estado del usuario
                user.status = 'Documentos subidos';
                await user.save();
                return response.successResponse(res, 200, 'Documentos subidos exitosamente');
            } catch (error) {
                req.logger.error("Error al subir los documentos");
                return response.errorResponse(res, 500, 'Error al subir los documentos');
            }
        });
    }
};

export default userController;