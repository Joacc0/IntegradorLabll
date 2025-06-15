import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Estilos globales
import './styles/globals.css';

// Importar polyfills para compatibilidad (opcional pero recomendado)
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// Configuración de tooltips (opcional)
import 'react-tooltip/dist/react-tooltip.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);