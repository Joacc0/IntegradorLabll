// En routes/images.js
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/albums/:id/images', auth, upload.single('image'), async (req, res) => {
  const album = await Album.findById(req.params.id);
  if (!album) return res.status(404).send();
  
  album.images.push({
    url: req.file.path,
    caption: req.body.caption
  });
  
  await album.save();
  res.send(album);
});