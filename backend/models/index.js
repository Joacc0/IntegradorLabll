import { readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Sequelize from 'sequelize';
import sequelize from '../config/sequelizeConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = {};
const modelsPath = path.join(__dirname);

const modelFiles = readdirSync(modelsPath)
  .filter(file => file !== 'index.js' && file.endsWith('.js'));

for (const file of modelFiles) {
  try {
    const modelPath = path.join(modelsPath, file);
    
    // SOLUCIÓN ESPECÍFICA PARA WINDOWS - Coloca esta línea aquí:
    const modelUrl = new URL(`file:///${modelPath.replace(/\\/g, '/')}`).href;
    
    const module = await import(modelUrl);
    const model = module.default(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  } catch (error) {
    console.error(`Error al cargar el modelo ${file}:`, error);
    process.exit(1);
  }
}

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
