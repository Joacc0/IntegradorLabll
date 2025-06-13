const Notification = require('../models/Notification');
const User = require('../models/User');

module.exports = function(io) {
  io.on('connection', (socket) => {
    console.log(`Nueva conexión Socket.io: ${socket.id}`);

    // Manejar unión a sala de usuario específico
    socket.on('joinUserRoom', async (userId) => {
      socket.join(userId);
      console.log(`Usuario ${userId} se unió a su sala de notificaciones`);
      
      // Enviar notificaciones no leídas al conectar
      try {
        const unreadNotifications = await Notification.find({
          recipient: userId,
          isRead: false
        })
        .populate('sender', 'firstName lastName profileImage')
        .sort({ createdAt: -1 })
        .limit(10);

        if (unreadNotifications.length > 0) {
          socket.emit('initialUnreadNotifications', unreadNotifications);
        }
      } catch (err) {
        console.error('Error al obtener notificaciones no leídas:', err);
      }
    });

    // Manejar solicitudes de amistad
    socket.on('friendRequest', async ({ senderId, receiverId }) => {
      try {
        const sender = await User.findById(senderId).select('firstName lastName profileImage');
        
        if (!sender) {
          console.error('Usuario remitente no encontrado');
          return;
        }

        // Crear notificación en la base de datos
        const notification = await Notification.create({
          recipient: receiverId,
          sender: senderId,
          type: 'friendRequest',
          content: `${sender.firstName} ${sender.lastName} te envió una solicitud de amistad`
        });

        // Emitir notificación en tiempo real
        io.to(receiverId.toString()).emit('newFriendRequest', {
          notificationId: notification._id,
          sender: {
            id: sender._id,
            firstName: sender.firstName,
            lastName: sender.lastName,
            profileImage: sender.profileImage
          },
          createdAt: notification.createdAt
        });

      } catch (err) {
        console.error('Error en friendRequest:', err);
      }
    });

    // Manejar notificación de solicitud de amistad aceptada
    socket.on('friendRequestAccepted', async ({ recipientId, requesterId }) => {
      try {
        const recipient = await User.findById(recipientId).select('firstName lastName profileImage');
        
        if (!recipient) {
          console.error('Usuario remitente no encontrado');
          return;
        }

        // Crear notificación en la base de datos
        const notification = await Notification.create({
          recipient: requesterId,
          sender: recipientId,
          type: 'friendRequestAccepted',
          content: `${recipient.firstName} ${recipient.lastName} aceptó tu solicitud de amistad`
        });

        // Emitir notificación en tiempo real
        io.to(requesterId.toString()).emit('friendRequestAccepted', {
          notificationId: notification._id,
          recipient: {
            id: recipient._id,
            firstName: recipient.firstName,
            lastName: recipient.lastName,
            profileImage: recipient.profileImage
          },
          createdAt: notification.createdAt
        });

      } catch (err) {
        console.error('Error en friendRequestAccepted:', err);
      }
    });

    // Manejar nuevos comentarios
    socket.on('newComment', async ({ imageOwnerId, commenterId, imageId, albumId, commentText }) => {
      try {
        // Verificar que no sea el dueño de la imagen comentándose a sí mismo
        if (imageOwnerId.toString() === commenterId.toString()) return;

        const commenter = await User.findById(commenterId).select('firstName lastName profileImage');
        const truncatedComment = commentText.substring(0, 30) + (commentText.length > 30 ? '...' : '');

        // Crear notificación en la base de datos
        const notification = await Notification.create({
          recipient: imageOwnerId,
          sender: commenterId,
          type: 'comment',
          content: `${commenter.firstName} ${commenter.lastName} comentó tu imagen: "${truncatedComment}"`,
          relatedEntity: imageId
        });

        // Emitir notificación en tiempo real
        io.to(imageOwnerId.toString()).emit('commentNotification', {
          notificationId: notification._id,
          commenter: {
            id: commenter._id,
            firstName: commenter.firstName,
            lastName: commenter.lastName,
            profileImage: commenter.profileImage
          },
          imageId,
          albumId,
          commentPreview: truncatedComment,
          createdAt: notification.createdAt
        });

      } catch (err) {
        console.error('Error en newComment:', err);
      }
    });

    // Manejar notificaciones de álbumes compartidos
    socket.on('albumShared', async ({ albumId, recipientId, sharerId }) => {
      try {
        const sharer = await User.findById(sharerId).select('firstName lastName profileImage');
        const album = await Album.findById(albumId).select('title');

        if (!sharer || !album) {
          console.error('Usuario o álbum no encontrado');
          return;
        }

        // Crear notificación en la base de datos
        const notification = await Notification.create({
          recipient: recipientId,
          sender: sharerId,
          type: 'albumShared',
          content: `${sharer.firstName} ${sharer.lastName} compartió el álbum "${album.title}" contigo`,
          relatedEntity: albumId
        });

        // Emitir notificación en tiempo real
        io.to(recipientId.toString()).emit('albumSharedNotification', {
          notificationId: notification._id,
          sharer: {
            id: sharer._id,
            firstName: sharer.firstName,
            lastName: sharer.lastName,
            profileImage: sharer.profileImage
          },
          album: {
            id: album._id,
            title: album.title
          },
          createdAt: notification.createdAt
        });

      } catch (err) {
        console.error('Error en albumShared:', err);
      }
    });

    // Manejar desconexión
    socket.on('disconnect', () => {
      console.log(`Usuario desconectado: ${socket.id}`);
    });
  });
};