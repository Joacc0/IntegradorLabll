const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importar rutas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const albumRoutes = require('./routes/albums');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error('Error de conexión a MongoDB:', err));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/albums', albumRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

// En server.js (después de app.listen)
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    socket.join(userId);
  });
  
  socket.on('friendRequest', ({ to, from }) => {
    io.to(to).emit('newFriendRequest', { from });
  });
});