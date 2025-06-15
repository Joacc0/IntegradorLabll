import { useAuth } from '../../context/AuthContext'
import NotificationCenter from '../../components/notifications/NotificationCenter'

const HomePage = () => {
  const { user } = useAuth()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Bienvenido, {user?.firstName}</h1>
        <NotificationCenter />
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-lg">Explora los álbumes de la comunidad.</p>
      </div>
    </div>
  )
}

export default HomePage