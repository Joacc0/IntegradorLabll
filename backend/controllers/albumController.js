import db from '../models/index.js';

// Helper para manejar errores
const handleError = (res, err) => {
  console.error(err);
  return res.status(500).json({ 
    success: false, 
    error: 'Error en el servidor' 
  });
};

export const getAlbums = async (req, res) => {
  try {
    const albums = await db.Album.findAll({
      where: { userId: req.user.id },
      include: [{
        model: db.Image,
        attributes: ['id', 'url']
      }]
    });
    res.status(200).json({ success: true, data: albums });
  } catch (err) {
    handleError(res, err);
  }
};

export const getAlbum = async (req, res) => {
  try {
    const album = await db.Album.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: [
        { model: db.Image },
        { model: db.User, attributes: ['id', 'firstName', 'profileImage'] }
      ]
    });
    
    if (!album) {
      return res.status(404).json({ 
        success: false, 
        error: 'Álbum no encontrado' 
      });
    }
    
    res.status(200).json({ success: true, data: album });
  } catch (err) {
    handleError(res, err);
  }
};

export const addImageToAlbum = async (req, res) => {
  try {
    const album = await db.Album.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!album) {
      return res.status(404).json({ 
        success: false, 
        error: 'Álbum no encontrado' 
      });
    }

    const image = await db.Image.create({
      url: req.body.url,
      albumId: album.id,
      userId: req.user.id
    });

    res.status(201).json({ 
      success: true, 
      data: { id: image.id, url: image.url } 
    });
  } catch (err) {
    handleError(res, err);
  }
};

// Exporta los demás métodos con la misma estructura
export const createAlbum = async (req, res) => { /*...*/ };
export const updateAlbum = async (req, res) => { /*...*/ };
export const deleteAlbum = async (req, res) => { /*...*/ };
export const deleteImageFromAlbum = async (req, res) => { /*...*/ };
export const shareAlbum = async (req, res) => { /*...*/ };