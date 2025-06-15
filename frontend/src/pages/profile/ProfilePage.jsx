import { useAuth } from '../../context/AuthContext'

const ProfilePage = () => {
  const { user } = useAuth()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="flex items-center space-x-4">
            <img 
              src={user?.profileImage || '/images/default-profile.png'} 
              alt="Profile" 
              className="w-20 h-20 rounded-full"
            />
            <div>
              <h1 className="text-2xl font-bold">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-gray-600">@{user?.email.split('@')[0]}</p>
            </div>
          </div>
          
          <div className="mt-6">
            <h2 className="text-xl font-semibold">Mis Estadísticas</h2>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <StatCard title="Álbumes" value="5" />
              <StatCard title="Seguidores" value="120" />
              <StatCard title="Comentarios" value="34" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const StatCard = ({ title, value }) => (
  <div className="bg-gray-50 p-4 rounded-lg text-center">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
)

export default ProfilePage