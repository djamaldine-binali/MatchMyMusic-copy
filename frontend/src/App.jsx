import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MainPage from './pages/MainPage';
import Profile from './pages/Profile';
import NewReleases from './pages/NewReleases';
import TrendingReleases from './pages/TrendingReleases';
import FavoritesPage from './pages/FavoritesPage';
import RatedMusics from './pages/RatedMusics';
import MatchesPage from './pages/MatchesPage';
import MusicDetailPage from './pages/MusicDetailPage';
import AdminPage from './pages/AdminPage';
import SettingsPage from './pages/SettingsPage';
import NotificationsPage from './pages/NotificationsPage';
import ChatButton from './components/ChatButton';

// Exposer toast globalement pour que les hooks puissent l'utiliser
if (typeof window !== 'undefined') {
  window.toast = toast;
}

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/main" element={<MainPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/new-releases" element={<NewReleases />} />
          <Route path="/trending-releases" element={<TrendingReleases />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/ratings" element={<RatedMusics />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/music/:musicId/:title/:artist/:coverUrl" element={<MusicDetailPage />} />
          <Route path="/music/:musicId" element={<MusicDetailPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Routes>
        
        {/* Bouton de chat flottant visible sur toutes les pages */}
        <ChatButton />
      </Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
}

export default App;
