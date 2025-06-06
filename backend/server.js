require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db'); // Conexión a la DB
const cors = require('cors');
const path = require('path');

// Importar rutas
const authRoutes = require('./routes/auth');
// ... otras rutas

const app = express();

// 1. Conectar a MongoDB
connectDB();

// 2. Middlewares básicos
app.use(cors());
app.use(express.json()); // Para parsear JSON
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Servir archivos estáticos

// 3. Rutas
app.use('/api/auth', authRoutes);
// ... otras rutas

// 4. Manejo básico de errores (opcional pero recomendado)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo salió mal!');
});

// 5. Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
});