import swaggerJsdoc from "swagger-jsdoc";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Kizuna Railway API",
            version: "1.0.0",
            description: "API documentation for the Kizuna railway application",
        },
        servers: [
            {
                url: "http://127.0.0.1:3000",
                description: "Local development server",
            },
            {
                url: "https://your-render-app.onrender.com",
                description: "Production server",
            },
        ],
    },
    apis: ["./src/routes/*.js"],
};

const swaggerDocument = swaggerJsdoc(options);

export default swaggerDocument;