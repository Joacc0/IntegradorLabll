import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración absoluta para .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar ENV con path absoluto
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../env/.env') });

// Validar variables críticas
const requiredVars = ['DB_HOST', 'DB_USER', 'DB_NAME'];
for (const varName of requiredVars) {
  if (!process.env[varName]) {
    console.error(`❌ FALTA variable de entorno: ${varName}`);
    process.exit(1);
  }
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD, // Puede ser undefined (para contraseña vacía)
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      connectTimeout: 10000 // 10 segundos de timeout
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Prueba de conexión inmediata
sequelize.authenticate()
  .then(() => console.log('✅ Prueba de conexión a MySQL exitosa'))
  .catch(err => {
    console.error('❌ Error de conexión a MySQL:');
    console.error('🔍 Mensaje:', err.message);
    console.error('📌 Código:', err.parent?.code || 'N/A');
    process.exit(1);
  });

export default sequelize;