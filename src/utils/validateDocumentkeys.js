export const validateDocumentKeys = (req, res, next) => {
    const expectedKeys = ["identificacion", "domicilio", "cuenta", "profileImage", "productImage"];
    const files = req.files;

    for (let field in files) {
        if (!expectedKeys.includes(field)) {
            return response.errorResponse(res, 400, `La clave '${field}' no es válida o no está permitida`);
        }
    }

    next();
};