import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { toast } from 'react-toastify';
import { useFavorites } from '../hooks/useFavorites';
import MusicCard from '../components/MusicCard';

function CardPopover({ onClose, onAddToFavorites, onRate }) {
  return (
    <div style={{
      position: 'absolute',
      top: 38,
      right: 10,
      background: 'rgba(30,30,30,0.98)',
      borderRadius: 10,
      boxShadow: '0 2px 12px 0 rgba(0,0,0,0.18)',
      zIndex: 10,
      minWidth: 140,
      padding: '10px 0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: 0,
    }}>
      <button onClick={onAddToFavorites} style={{
        background: 'none',
        border: 'none',
        color: '#fff',
        fontWeight: 700,
        fontSize: '1rem',
        padding: '10px 18px',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'background 0.15s',
      }} onMouseDown={e => e.preventDefault()}>Ajouter aux favoris</button>
      <button onClick={onRate} style={{
        background: 'none',
        border: 'none',
        color: '#ff9100',
        fontWeight: 700,
        fontSize: '1rem',
        padding: '10px 18px',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'background 0.15s',
      }} onMouseDown={e => e.preventDefault()}>Noter maintenant</button>
    </div>
  );
}

function StarRating({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 2, marginTop: 6 }}>
      {[1,2,3,4,5].map(star => (
        <span
          key={star}
          style={{
            fontSize: 22,
            color: star <= value ? '#ff9100' : '#fff',
            cursor: 'pointer',
            userSelect: 'none',
            transition: 'color 0.15s',
          }}
          onClick={() => onChange(star)}
        >★</span>
      ))}
    </div>
  );
}

export default function TrendingReleases() {
  const navigate = useNavigate();
  const [trendingAlbums, setTrendingAlbums] = useState([]);
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [popover, setPopover] = useState({ type: null, id: null });
  const [rating, setRating] = useState({});
  const { favorites, addToFavorites: addToFavoritesHook, removeFromFavorites: removeFromFavoritesHook } = useFavorites();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/music/trending-albums-full').then(res => res.json()),
      fetch('/api/music/trending-songs-full').then(res => res.json())
    ])
      .then(([albumsData, songsData]) => {
        setTrendingAlbums(albumsData.albums || []);
        setTrendingSongs(songsData.songs || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Fonction pour noter une musique
  const setRatingApi = async (musicId, value, title) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Vous devez être connecté pour noter');
        return;
      }

      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ musicId, value })
      });

      if (response.ok) {
        setRating(prev => ({ ...prev, [musicId]: value }));
        toast.success(`Note ${value}/5 enregistrée pour ${title} !`);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Erreur lors de la notation');
      }
    } catch (error) {
      console.error('Error setting rating:', error);
      toast.error('Erreur lors de la notation');
    }
  };

  // Handlers for popover actions
  const handleAddToFavorites = (type, id, title) => {
    setPopover({ type: null, id: null });
    // Trouver l'élément pour récupérer artist et coverUrl
    const item = type === 'album' ? 
      trendingAlbums.find(a => a.id === id) : 
      trendingSongs.find(s => s.id === id);
    
    if (item) {
      addToFavoritesHook(id, title, item.artist, item.coverUrl || item.cover);
    } else {
      addToFavoritesHook(id, title);
    }
  };
  
  const handleRate = (type, id) => {
    setPopover({ type, id });
  };
  
  const handleSetRating = (type, id, value, title) => {
    setRatingApi(id, value, title);
    setPopover({ type: null, id: null });
  };

  return (
    <>
      <Header />
      <div style={{ background: '#18151c', color: '#fff', minHeight: '100vh', padding: '0 0 40px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 0 32px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
            <div>
              <h1 style={{ fontWeight: 900, fontSize: '2.5rem', marginBottom: 8 }}>Trending Releases</h1>
              <p style={{ color: '#d1d1d6', fontSize: '1.1rem', margin: 0 }}>Découvrez ce qui fait sensation</p>
            </div>
            <button 
              onClick={() => navigate('/main')}
              style={{
                background: 'none',
                border: '2px solid #ff9100',
                color: '#ff9100',
                padding: '12px 24px',
                borderRadius: 8,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.target.style.background = '#ff9100';
                e.target.style.color = '#18151c';
              }}
              onMouseLeave={e => {
                e.target.style.background = 'none';
                e.target.style.color = '#ff9100';
              }}
            >
              ← Retour
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', fontSize: '1.2rem' }}>Chargement...</div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#ff3e3e' }}>{error}</div>
          ) : (
            <div>
              {/* Albums Section */}
              {trendingAlbums.length > 0 && (
                <div style={{ marginBottom: 48 }}>
                  <h2 style={{ fontWeight: 700, fontSize: '1.8rem', marginBottom: 24, color: '#ff9100' }}>Albums</h2>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
                    gap: 28,
                    justifyContent: 'center'
                  }}>
                    {trendingAlbums.map(album => (
                      <MusicCard 
                        key={album.id} 
                        item={album} 
                        type="album" 
                        showRating={true}
                        currentRating={rating[album.id] || 0}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Songs Section */}
              {trendingSongs.length > 0 && (
                <div>
                  <h2 style={{ fontWeight: '700', fontSize: '1.8rem', marginBottom: 24, color: '#ff9100' }}>Songs</h2>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
                    gap: 28,
                    justifyContent: 'center'
                  }}>
                    {trendingSongs.map(song => (
                      <MusicCard 
                        key={song.id} 
                        item={song} 
                        type="song" 
                        showRating={true}
                        currentRating={rating[song.id] || 0}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
} 