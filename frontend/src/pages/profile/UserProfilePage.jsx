import { useParams } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { Loader } from '../../components/shared/Loader'

const UserProfilePage = () => {
  const { userId } = useParams()
  const { data: user, loading } = useApi(() => getUser(userId))

  if (loading) return <Loader />

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <img 
            src={user.profileImage || '/default-profile.png'} 
            className="w-20 h-20 rounded-full"
          />
          <div>
            <h1 className="text-2xl font-bold">{user.firstName} {user.lastName}</h1>
            <p className="text-gray-600">{user.bio || 'Sin biografía'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfilePage