import { useEffect, useState } from 'react'
import { useAuth } from "../../context/AuthContext";
import { getAlbums } from '../../services/albumService'
import AlbumCard from '../../components/albums/AlbumCard'
import { Link } from 'react-router-dom'

const AlbumsPage = () => {
  const { user } = useAuth()
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
  console.log('User ID:', user?._id) // ← Verifica que tengas ID
  if (!user?._id) return;

  const fetchAlbums = async () => {
    try {
      const data = await getAlbums(user._id)
      console.log('Albums data:', data) // ← Verifica la respuesta
      setAlbums(data)
    } catch (error) {
      console.error('Error fetching albums:', error)
    } finally {
      setLoading(false)
    }
  }
  fetchAlbums()
}, [user?._id])

  if (loading) return <div>Cargando álbumes...</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mis Álbumes</h1>
        <Link
          to="/albums/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Crear Álbum
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {albums.map(album => (
          <AlbumCard key={album._id} album={album} />
        ))}
      </div>
    </div>
  )
}

export default AlbumsPage