const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CRUD API',
      version: '1.0.0',
    },
  },
  apis: ['./app.js'], // Point to the main application file
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
