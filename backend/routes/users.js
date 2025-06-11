// Solicitud de amistad
router.post('/:id/friend-request', auth, async (req, res) => {
  try {
    const recipient = await User.findById(req.params.id);
    if (!recipient) return res.status(404).send();
    
    // Evitar duplicados
    const existingRequest = req.user.friends.find(
      f => f.userId.equals(recipient._id)
    );
    
    if (existingRequest) return res.status(400).send('Solicitud ya enviada');
    
    req.user.friends.push({ userId: recipient._id, status: 'pending' });
    await req.user.save();
    
    // Emitir notificación
    req.io.to(recipient._id.toString()).emit('friendRequest', {
      from: req.user.username,
      message: 'Te ha enviado una solicitud de amistad'
    });
    
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});

router.post('/:id/friend-request', auth, async (req, res) => {
  const recipient = await User.findById(req.params.id);
  if (!recipient) return res.status(404).send();
  
  req.user.friends.push({ userId: recipient._id, status: 'pending' });
  await req.user.save();
  res.send();
});

// Aceptar/rechazar solicitud
router.patch('/friend-requests/:id', auth, async (req, res) => {
  try {
    const request = await User.findOne({
      'friends.userId': req.user._id,
      'friends.status': 'pending'
    });
    
    if (!request) return res.status(404).send();
    
    const friendRequest = request.friends.find(f => 
      f.userId.equals(req.user._id)
    );
    
    friendRequest.status = req.body.status; // 'accepted' o 'rejected'
    await request.save();
    
    // Si se acepta, crear álbum compartido
    if (req.body.status === 'accepted') {
      const album = new Album({
        title: `${request.profile.firstName} ${request.profile.lastName}`,
        creator: request._id,
        sharedWith: [req.user._id]
      });
      await album.save();
    }
    
    // Notificar al solicitante
    req.io.to(request._id.toString()).emit('friendRequestResponse', {
      to: req.user.username,
      status: req.body.status
    });
    
    res.send();
  } catch (error) {
    res.status(500).send();
  }
});