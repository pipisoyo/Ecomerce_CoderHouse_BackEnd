import { __dirname } from "../config.js";
import swggerJSDoc from 'swagger-jsdoc'

const swaggerOptions = {
    definition:{
        openapi :'3.0.1',
        info : {
            title : "API E-comerece CoderHouse",
            description : " La api es un proyecto que es desarrollado desde cero para coderHouse ,"
        },
    },
    apis :[`${__dirname}/docs/**/*.yaml`]
}

const epecs = swggerJSDoc(swaggerOptions)

export default epecs