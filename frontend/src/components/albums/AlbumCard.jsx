import { Link } from 'react-router-dom'

const AlbumCard = ({ album }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <Link to={`/albums/${album._id}`}>
        {album.images.length > 0 ? (
          <img
            src={album.images[0].url}
            alt={album.title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">Sin imágenes</span>
          </div>
        )}
        <div className="p-4">
          <h3 className="font-semibold text-lg">{album.title}</h3>
          <p className="text-gray-600 text-sm mt-1">
            {album.images.length} {album.images.length === 1 ? 'imagen' : 'imágenes'}
          </p>
        </div>
      </Link>
    </div>
  )
}

export default AlbumCard