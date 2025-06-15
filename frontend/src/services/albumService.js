import api from './api'

export const getAlbums = (userId) => api.get(`/api/albums/user/${userId}`)
export const getAlbum = (id) => api.get(`/api/albums/${id}`)
export const createAlbum = (albumData) => api.post('/api/albums', albumData)
export const updateAlbum = (id, albumData) => api.put(`/api/albums/${id}`, albumData)
export const deleteAlbum = (id) => api.delete(`/api/albums/${id}`)
export const addImageToAlbum = (albumId, imageData) => api.post(`/api/albums/${albumId}/images`, imageData)
export const deleteImageFromAlbum = (albumId, imageId) => api.delete(`/api/albums/${albumId}/images/${imageId}`)
export const shareAlbum = (albumId, userId) => api.post(`/api/albums/${albumId}/share`, { userId })