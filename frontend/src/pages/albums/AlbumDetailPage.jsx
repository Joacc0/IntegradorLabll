import { useParams } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { Loader } from '../../components/shared/Loader'

const AlbumDetailPage = () => {
  const { id } = useParams()
  const { data: album, loading, error } = useApi(() => getAlbum(id))

  if (loading) return <Loader />
  if (error) return <p>Error al cargar el álbum</p>

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">{album.title}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {album.images.map(image => (
          <img 
            key={image._id} 
            src={image.url} 
            alt={image.caption} 
            className="rounded-lg shadow-md"
          />
        ))}
      </div>
    </div>
  )
}

export default AlbumDetailPage