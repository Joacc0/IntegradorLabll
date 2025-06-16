#!/usr/bin/env node
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import sequelize from './config/sequelizeConfig.js';
import routes from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';
import socketService from './services/socketService.js';

// =============================================
// 1. Configuración Inicial y Carga de Variables
// =============================================

// Configuración de rutas absolutas
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno con path absoluto
const envPath = path.resolve(__dirname, 'env', '.env');
console.log(`🔄 Buscando archivo .env en: ${envPath}`);

try {
  dotenv.config({ path: envPath });
  console.log('✅ Archivo .env cargado correctamente');
} catch (err) {
  console.error('❌ Error al cargar .env:', err.message);
  console.error('ℹ️ Asegúrate que el archivo exista en la ruta indicada');
  process.exit(1);
}

// Validar variables de entorno críticas
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_NAME', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.error('❌ Variables faltantes en .env:', missingVars);
  console.error('ℹ️ Ejemplo de configuración mínima requerida:');
  console.error(`
    DB_HOST=localhost
    DB_USER=root
    DB_NAME=artesanos_dev
    JWT_SECRET=una_clave_secreta_compleja
  `);
  process.exit(1);
}

// Mostrar configuración cargada (solo desarrollo)
if (process.env.NODE_ENV !== 'production') {
  console.log('🔍 Configuración cargada:', {
    NODE_ENV: process.env.NODE_ENV || 'development',
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_NAME: process.env.DB_NAME,
    DB_PORT: process.env.DB_PORT || 3306
  });
}

// =============================================
// 2. Inicialización de la Aplicación
// =============================================

const app = express();
const server = http.createServer(app);

// Configurar Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// =============================================
// 3. Middlewares Esenciales
// =============================================

app.use(cors({
  origin: process.env.FRONTEND_URL?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware de logging para desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// =============================================
// 4. Conexión a Base de Datos
// =============================================

const initializeDatabase = async () => {
  try {
    console.log('🔄 Conectando a MySQL...');
    
    await sequelize.authenticate();
    console.log('✅ Conexión a MySQL establecida');
    
    if (process.env.NODE_ENV === 'development') {
      console.log('⚙️  Sincronizando modelos...');
      await sequelize.sync({ alter: true });
      console.log('🔄 Modelos sincronizados');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error de conexión a MySQL:');
    console.error('🔍 Mensaje:', error.message);
    
    // Diagnóstico específico para errores comunes
    if (error.original?.code === 'ECONNREFUSED') {
      console.error('\n👉 ¿Está MySQL corriendo? Prueba estos comandos:');
      console.error('   - En Windows: Verifica el servicio "MySQL"');
      console.error('   - En Linux/Mac: sudo service mysql status');
      console.error('   - mysql -u root -p (para probar conexión manual)');
    }
    
    if (error.original?.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n👉 Credenciales incorrectas. Verifica:');
      console.error('   - Usuario y contraseña en el archivo .env');
      console.error('   - Permisos del usuario en MySQL');
    }
    
    return false;
  }
};

// =============================================
// 5. Configuración de Rutas y Sockets
// =============================================

const configureApplication = () => {
  // Configurar rutas principales
  app.use('/api', routes);
  
  // Configurar Socket.io
  socketService(io);
  
  // Middleware de errores (DEBE ser el último)
  app.use(errorHandler);
};

// =============================================
// 6. Inicio del Servidor
// =============================================

const startServer = async () => {
  // 1. Conectar a la base de datos
  const dbSuccess = await initializeDatabase();
  if (!dbSuccess) {
    console.error('🛑 No se puede iniciar sin conexión a la base de datos');
    process.exit(1);
  }

  // 2. Configurar la aplicación
  configureApplication();

  // 3. Iniciar el servidor
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log('\n=============================================');
    console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`);
    console.log(`⚙️  Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🛌 Base de datos: ${process.env.DB_NAME}`);
    console.log('=============================================\n');
  });
};

// =============================================
// 7. Manejo de Errores Globales
// =============================================

process.on('unhandledRejection', (err) => {
  console.error('⚠️ Error no manejado:', err);
});

process.on('uncaughtException', (err) => {
  console.error('⚠️ Excepción no capturada:', err);
  process.exit(1);
});

// Manejo elegante de cierre
['SIGINT', 'SIGTERM'].forEach(signal => {
  process.on(signal, () => {
    console.log(`\n${signal} recibido - Cerrando servidor...`);
    server.close(() => {
      sequelize.close().then(() => {
        console.log('✅ Servidor y conexiones cerradas correctamente');
        process.exit(0);
      });
    });
  });
});

// =============================================
// Iniciar la Aplicación
// =============================================
startServer();