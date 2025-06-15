import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import PrivateRoute from './components/shared/PrivateRoute';

// Importación de páginas agrupadas por categoría
import HomePage from './pages/home/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AlbumsPage from './pages/albums/AlbumsPage';
import AlbumDetailPage from './pages/albums/AlbumDetailPage';
import ProfilePage from './pages/profile/ProfilePage';
import UserProfilePage from './pages/profile/UserProfilePage';
import NotFoundPage from './pages/404';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Rutas semipúblicas (acceso a perfiles y álbumes) */}
            <Route path="/profile/:userId" element={<UserProfilePage />} />
            <Route path="/albums/:id" element={<AlbumDetailPage />} />

            {/* Rutas privadas (requieren autenticación) */}
            <Route element={<PrivateRoute />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/albums" element={<AlbumsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Ruta de error 404 - debe ir al final */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;