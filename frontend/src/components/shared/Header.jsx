import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <nav className="flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">Artesanos.com</Link>
        <div className="space-x-4">
          <Link to="/" className="hover:underline">Inicio</Link>
          <Link to="/albums" className="hover:underline">Álbumes</Link>
          <Link to="/login" className="hover:underline">Login</Link>
        </div>
      </nav>
    </header>
  )
}