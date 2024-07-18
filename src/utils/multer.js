import multer from 'multer'
import { __dirname } from '../config.js';


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = __dirname+'/public/documents'; // Carpeta por defecto
        
      
     
  
      if (file.fieldname === 'profileImage') {
        uploadPath = __dirname+'/public/profiles'; // Carpeta para imágenes de perfil
      } else if (file.fieldname === 'productImage') {
        uploadPath = __dirname+'/public/products'; // Carpeta para imágenes de productos
      }
  
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname);
    }
  });
  export const upload = multer({ storage, onError: function(err, next){

    console.log(err)
    next()
}})