import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/home/HomePage'
import AlbumsPage from './pages/albums/AlbumsPage'
import AlbumDetailPage from './pages/albums/AlbumDetailPage'
import LoginPage from './pages/auth/LoginPage'
import PrivateRoute from './components/shared/PrivateRoute.jsx'
import Header from './components/shared/Header' // Necesitarías crearlo
import NotFoundPage from './pages/404'

function App() {
  return (
    <Router>
      <Header />
      <main className="container mx-auto py-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/albums" element={<AlbumsPage />} />
          <Route path="/albums/:id" element={<AlbumDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </Router>
  )
}

export default App