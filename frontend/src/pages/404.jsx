import { Link } from 'react-router-dom'

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <p className="mt-4 text-xl">Página no encontrada</p>
        <Link 
          to="/" 
          className="mt-6 inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage