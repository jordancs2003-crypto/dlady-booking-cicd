const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const swaggerUi = require('swagger-ui-express');

const appointmentRoutes = require('./routes/appointmentRoutes');

const app = express();

app.disable('x-powered-by');

app.use(helmet({
  contentSecurityPolicy: false
}));

app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

app.use(express.static(path.join(__dirname, '../public')));

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
   title: 'API de citas D\'Lady',
    version: '1.0.0',
    description: 'API REST para administrar citas del centro de belleza D\'Lady'
  },
  servers: [
    {
      url: '/api'
    }
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Comprobar estado de la aplicación',
        responses: {
          200: {
            description: 'Aplicación funcionando'
          }
        }
      }
    },
    '/appointments': {
      get: {
        summary: 'Obtener todas las citas',
        responses: {
          200: {
            description: 'Listado de citas'
          }
        }
      },
      post: {
        summary: 'Crear una cita',
        responses: {
          201: {
            description: 'Cita creada'
          },
          400: {
            description: 'Datos inválidos'
          }
        }
      }
    }
  }
};

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'dlady-booking-api',
    status: 'UP',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/appointments', appointmentRoutes);

app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Recurso no encontrado.'
  });
});

app.use((error, req, res, next) => {
  console.error(error);

  res.status(500).json({
    success: false,
    message: 'Error interno del servidor.'
  });
});

module.exports = app;