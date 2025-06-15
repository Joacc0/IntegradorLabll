const errorHandler = (err, req, res, next) => {
  let error = { ...err, message: err.message };

  console.error(err.stack);

  // Manejo de errores de Mongoose
  if (err.name === 'CastError') {
    error = {
      message: `Recurso no encontrado con ID ${err.value}`,
      statusCode: 404
    };
  }

  if (err.code === 11000) {
    error = {
      message: 'Valor duplicado ingresado',
      statusCode: 400
    };
  }

  if (err.name === 'ValidationError') {
    error = {
      message: Object.values(err.errors).map(val => val.message),
      statusCode: 400
    };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Error del servidor'
  });
};

export default errorHandler;