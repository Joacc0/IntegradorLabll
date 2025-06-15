//Funciones utiles reutilizables

// Formatear fechas
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Acortar texto
export const truncateText = (text, maxLength = 50) => {
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
}