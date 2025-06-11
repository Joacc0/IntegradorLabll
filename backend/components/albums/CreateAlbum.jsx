import React, { useState } from 'react';
import api from '../../services/api';

const CreateAlbum = () => {
  const [title, setTitle] = useState('');
  const [images, setImages] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/albums', { title, images });
      alert('Álbum creado exitosamente!');
    } catch (error) {
      console.error('Error al crear álbum:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título del álbum"
        required
      />
      <button type="submit">Crear Álbum</button>
    </form>
  );
};

export default CreateAlbum;