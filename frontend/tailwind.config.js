/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    // Rutas específicas para mejorar el rendimiento del escaneo:
    "./src/pages/**/*.jsx",
    "./src/components/**/*.jsx",
    "./src/context/**/*.jsx"
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'] // Integra la fuente de tu globals.css
      },
      colors: {
        // Basado en tu Header.jsx (bg-blue-600)
        primary: {
          600: '#2563eb',
          700: '#1d4ed8' // Versión más oscura para hover/states
        },
        // Colores adicionales para tu UI
        artesanos: {
          light: '#f8fafc',
          dark: '#0f172a'
        }
      }
    },
  },
  plugins: [
    // Plugin para estilos de formularios (útil para LoginPage)
    require('@tailwindcss/forms')({
      strategy: 'class' // Usa clases en lugar de estilos base
    })
  ],
  corePlugins: {
    // Habilita container si usas esta clase
    container: false // Recomendado desactivarlo para usar mx-auto manualmente
  }
}