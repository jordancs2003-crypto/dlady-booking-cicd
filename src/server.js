const app = require('./app');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`D'Lady Booking ejecutándose en el puerto ${PORT}`);
});

function gracefulShutdown(signal) {
  console.log(`${signal} recibido. Cerrando servidor...`);

  server.close(() => {
    console.log('Servidor cerrado correctamente.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));