import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import MusicCard from '../components/MusicCard';
import { useFavorites } from '../hooks/useFavorites';

function CardPopover({ onClose, onAddToFavorites, onAddToPlaylist, onRate, isInFavorites }) {
  return (
    <div style={{
      position: 'absolute',
      top: 38,
      right: 10,
      background: 'rgba(30,30,30,0.98)',
      borderRadius: 10,
      boxShadow: '0 2px 12px 0 rgba(0,0,0,0.18)',
      zIndex: 10,
      minWidth: 160,
      padding: '10px 0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: 0,
    }}>
      <button onClick={onAddToFavorites} style={{
        background: 'none',
        border: 'none',
        color: '#ff9100',
        fontWeight: 800,
        fontSize: '1rem',
        padding: '10px 18px',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'background 0.15s',
      }} onMouseDown={e => e.preventDefault()}>
        {isInFavorites ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      </button>
      <button onClick={onAddToPlaylist} style={{
        background: 'none',
        border: 'none',
        color: '#fff',
        fontWeight: 700,
        fontSize: '1rem',
        padding: '10px 18px',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'background 0.15s',
      }} onMouseDown={e => e.preventDefault()}>Ajouter à la playlist</button>
      <button onClick={onRate} style={{
        background: 'none',
        border: 'none',
        color: '#fff',
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

export default function MainPage() {
  const navigate = useNavigate();
  const { isInFavorites, handleHeartClick } = useFavorites();
  const [newAlbums, setNewAlbums] = useState([]);
  const [newSongs, setNewSongs] = useState([]);
  const [trendingAlbums, setTrendingAlbums] = useState([]);
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [loadingNewAlbums, setLoadingNewAlbums] = useState(true);
  const [loadingNewSongs, setLoadingNewSongs] = useState(true);
  const [loadingTrendingAlbums, setLoadingTrendingAlbums] = useState(true);
  const [loadingTrendingSongs, setLoadingTrendingSongs] = useState(true);
  const [errorNewAlbums, setErrorNewAlbums] = useState('');
  const [errorNewSongs, setErrorNewSongs] = useState('');
  const [errorTrendingAlbums, setErrorTrendingAlbums] = useState('');
  const [errorTrendingSongs, setErrorTrendingSongs] = useState('');
  const [user, setUser] = useState({ username: '', profilePic: '' });
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState('');
  const [popover, setPopover] = useState({ type: null, id: null });
  const [rating, setRating] = useState({});
  const [toast, setToast] = useState('');
  
  // États pour la barre de recherche
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUserLoading(false);
      return;
    }

    // Fetch user data
    fetch('/api/users/profile', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser(data.user);
        }
      })
      .catch(err => setUserError(err.message))
      .finally(() => setUserLoading(false));
  }, []);

  // Recherche en temps réel quand searchQuery change
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    // Effacer immédiatement les anciens résultats
    setSearchResults([]);
    setShowSearchResults(false);

    // Délai court pour éviter trop de requêtes
    const timeoutId = setTimeout(async () => {
      const currentQuery = searchQuery.trim();
      if (currentQuery === '') return;

      setSearchLoading(true);
      try {
        // Rechercher d'abord les albums
        const albumRes = await fetch(`/api/search?query=${encodeURIComponent(currentQuery)}&type=album`);
        const albumData = await albumRes.json();
        
        // Rechercher ensuite les tracks
        const trackRes = await fetch(`/api/search?query=${encodeURIComponent(currentQuery)}&type=track`);
        const trackData = await trackRes.json();

        // Vérifier que la requête n'a pas changé
        if (searchQuery.trim() === currentQuery) {
          // Combiner et limiter les résultats
          const combinedResults = [
            ...(albumData.results || []).slice(0, 5),
            ...(trackData.results || []).slice(0, 5)
          ];

          setSearchResults(combinedResults);
          setShowSearchResults(true);
        }
      } catch (error) {
        console.error('Erreur de recherche:', error);
        if (searchQuery.trim() === currentQuery) {
          setToast('Erreur lors de la recherche');
          setTimeout(() => setToast(''), 1800);
        }
      } finally {
        if (searchQuery.trim() === currentQuery) {
          setSearchLoading(false);
        }
      }
    }, 200); // Délai réduit à 200ms

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Fonction de recherche (maintenant gérée par le useEffect)
  const handleSearch = (e) => {
    e.preventDefault();
    // La recherche se fait automatiquement via le useEffect
  };

  const handleResultClick = (result) => {
    // Naviguer vers la page de détail de la musique
    // Utiliser l'ID de la musique trouvée pour la redirection
    if (result.id) {
      navigate(`/music/${result.id}`);
    } else {
      // Fallback si pas d'ID
      navigate('/new-releases');
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  useEffect(() => {
    // Load new albums
    fetch('/api/music/new-albums')
      .then(res => res.json())
      .then(data => {
        setNewAlbums(data.albums || []);
        setLoadingNewAlbums(false);
      })
      .catch(err => {
        setErrorNewAlbums(err.message);
        setLoadingNewAlbums(false);
      });

    // Load new songs
    fetch('/api/music/new-songs')
      .then(res => res.json())
      .then(data => {
        setNewSongs(data.songs || []);
        setLoadingNewSongs(false);
      })
      .catch(err => {
        setErrorNewSongs(err.message);
        setLoadingNewSongs(false);
      });

    // Load trending albums
    fetch('/api/music/trending')
      .then(res => res.json())
      .then(data => {
        setTrendingAlbums(data.albums || []);
        setLoadingTrendingAlbums(false);
      })
      .catch(err => {
        setErrorTrendingAlbums(err.message);
        setLoadingTrendingAlbums(false);
      });

    // Load trending songs
    fetch('/api/music/trending-songs')
      .then(res => res.json())
      .then(data => {
        setTrendingSongs(data.songs || []);
        setLoadingTrendingSongs(false);
      })
      .catch(err => {
        setErrorTrendingSongs(err.message);
        setLoadingTrendingSongs(false);
      });
  }, []);

  // Call API to set rating
  const setRatingApi = async (payload) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setToast('Veuillez vous connecter.');
        return false;
      }
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Erreur lors de la notation');
      }
      return true;
    } catch (e) {
      setToast(e.message || 'Erreur.');
      setTimeout(() => setToast(''), 1800);
      return false;
    }
  };

  // Handlers for popover actions
  const handleAddToPlaylist = (type, id) => {
    setPopover({ type: null, id: null });
    setToast('Ajout playlist (bientôt).');
    setTimeout(() => setToast(''), 1400);
  };
  const handleRate = (type, id) => {
    setPopover({ type, id });
  };
  const handleSetRating = async (type, id, value) => {
    setRating(r => ({ ...r, [`${type}-${id}`]: value }));
    setPopover({ type: null, id: null });
    const payload = type === 'album' ? {
      mbid: String(id), title: (trendingAlbums.concat(newAlbums).find(x => x.id === id)?.title) || '',
      albumMbid: String(id), albumTitle: (trendingAlbums.concat(newAlbums).find(x => x.id === id)?.title) || '',
      coverUrl: (trendingAlbums.concat(newAlbums).find(x => x.id === id)?.coverUrl) || null, value
    } : {
      mbid: String(id), title: (trendingSongs.concat(newSongs).find(x => x.id === id)?.title) || '',
      coverUrl: (trendingSongs.concat(newSongs).find(x => x.id === id)?.cover || trendingSongs.concat(newSongs).find(x => x.id === id)?.coverUrl) || null, value
    };
    const ok = await setRatingApi(payload);
    if (ok) {
      setToast(`Noté ${value}★`);
      setTimeout(() => setToast(''), 1400);
    }
  };

  // Card component for both albums and songs
  const Card = ({ item, type }) => {
    return (
      <MusicCard
        item={item}
        type={type}
        showRating={false}
      />
    );
  };

  return (
    <>
      <Header />
      {!!toast && (
        <div style={{
          position: 'fixed',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.85)',
          color: '#fff',
          padding: '10px 14px',
          borderRadius: 8,
          zIndex: 9999,
          boxShadow: '0 2px 12px rgba(0,0,0,0.25)'
        }}>{toast}</div>
      )}
      <div style={{ background: '#18151c', color: '#fff', minHeight: '100vh', padding: '0 0 40px 0' }}>
        {/* Barre de recherche */}
        <div style={{ 
          maxWidth: 900, 
          margin: '0 auto', 
          padding: '32px 0 24px 0',
          position: 'relative'
        }}>
          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            alignItems: 'center',
            width: '100%'
          }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchLoading ? "Recherche en cours..." : "Rechercher une musique ou un album..."}
              style={{
                flex: 1,
                padding: '16px 20px',
                borderRadius: '12px',
                border: '2px solid #333',
                background: searchLoading ? '#2a2a2a' : '#222',
                color: '#fff',
                fontSize: '1rem',
                fontWeight: '500',
                outline: 'none',
                transition: 'all 0.3s ease',
                fontFamily: "'Montserrat', 'Tahoma', sans-serif"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#ff9100';
                e.target.style.background = '#2a2a2a';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#333';
                e.target.style.background = searchLoading ? '#2a2a2a' : '#222';
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                style={{
                  background: '#666',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = '#777'}
                onMouseLeave={(e) => e.target.style.background = '#666'}
              >
                Effacer
              </button>
            )}
          </div>

          {/* Résultats de recherche */}
          {showSearchResults && searchResults.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: '#222',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
              border: '1px solid #333',
              marginTop: '12px',
              zIndex: 1000,
              maxHeight: '400px',
              overflow: 'auto'
            }}>
              <div style={{
                padding: '16px',
                borderBottom: '1px solid #333',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ 
                  fontSize: '1rem', 
                  fontWeight: '600', 
                  color: '#fff' 
                }}>
                  {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''} trouvé{searchResults.length > 1 ? 's' : ''}
                </span>
                <button
                  onClick={handleClearSearch}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#999',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    padding: '4px',
                    borderRadius: '4px',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#fff'}
                  onMouseLeave={(e) => e.target.style.color = '#999'}
                >
                  ✕
                </button>
              </div>
              {searchResults.map((result, index) => (
                <div
                  key={`${result.id}-${index}`}
                  onClick={() => handleResultClick(result)}
                  style={{
                    padding: '16px',
                    borderBottom: index < searchResults.length - 1 ? '1px solid #333' : 'none',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#2a2a2a'}
                  onMouseLeave={(e) => e.target.style.background = '#222'}
                >
                  <img
                    src={result.cover}
                    alt={result.title}
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '8px',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/50?text=No+Image';
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#fff',
                      marginBottom: '4px'
                    }}>
                      {result.title}
                    </div>
                    <div style={{
                      fontSize: '0.9rem',
                      color: '#ccc'
                    }}>
                      {result.artist}
                      {result.album && result.album !== result.title && ` • ${result.album}`}
                    </div>
                  </div>
                  <div style={{
                    color: '#ff9100',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    padding: '4px 8px',
                    background: 'rgba(255,145,0,0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,145,0,0.3)'
                  }}>
                    {result.album ? 'Album' : 'Titre'}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Message si pas de résultats */}
          {showSearchResults && searchResults.length === 0 && !searchLoading && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: '#222',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
              border: '1px solid #333',
              marginTop: '12px',
              zIndex: 1000,
              padding: '20px',
              textAlign: 'center'
            }}>
              <div style={{ color: '#ccc', fontSize: '1rem' }}>
                Aucun résultat trouvé pour "{searchQuery}"
              </div>
              <button
                onClick={handleClearSearch}
                style={{
                  marginTop: '12px',
                  background: '#ff9100',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Effacer la recherche
              </button>
            </div>
          )}
        </div>

        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 0 32px 0', textAlign: 'left' }}>
          <div style={{ fontWeight: 900, fontSize: '2.2rem', marginBottom: 18 }}>
            {userLoading ? '...' : userError ? 'Erreur utilisateur' : `Salut ${user.username}, on t'attendait !`}
          </div>
        </div>
        
        {/* New Releases Row */}
        <div style={{ maxWidth: 1200, margin: '0 auto', marginBottom: 48 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: 1030, marginBottom: 8 }}>
              <h2 style={{ fontWeight: 400, fontSize: '1.25rem', letterSpacing: 0.2, color: '#d1d1d6', margin: 0 }}>New on MatchMyMusic</h2>
              {newAlbums.length + newSongs.length > 6 && (
                <span style={{ color: '#ff9100', fontWeight: 500, fontSize: '1rem', cursor: 'pointer' }} onClick={() => navigate('/new-releases')}>more</span>
              )}
            </div>
            <div style={{ width: 1030, height: 2, background: 'linear-gradient(90deg, #333 0%, #444 100%)', marginBottom: 18, opacity: 0.7 }} />
            {(loadingNewAlbums || loadingNewSongs) ? (
              <div>Chargement...</div>
            ) : (errorNewAlbums || errorNewSongs) ? (
              <div style={{ color: '#ff3e3e' }}>{errorNewAlbums || errorNewSongs}</div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: 28, paddingBottom: 8, width: 1030, justifyContent: 'center' }}>
                  {[...newAlbums.slice(0, 6), ...newSongs.slice(0, 6 - newAlbums.slice(0, 6).length)].map((item, idx) => (
                    <MusicCard key={item.id + (item.title || '')} item={item} type={item.cover ? 'album' : 'song'} />
                  ))}
                </div>
                {/* Étoiles de notation pour New Releases */}
                <div style={{ display: 'flex', gap: 28, paddingTop: 8, width: 1030, justifyContent: 'center' }}>
                  {[...newAlbums.slice(0, 6), ...newSongs.slice(0, 6 - newAlbums.slice(0, 6).length)].map((item, idx) => (
                    <div key={`new-rating-${item.id}`} style={{ width: 150, display: 'flex', justifyContent: 'center' }}>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => {
                              handleSetRating(item.cover ? 'album' : 'song', item.id, star);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: 0,
                              fontSize: '14px',
                              color: star <= (rating[`${item.cover ? 'album' : 'song'}-${item.id}`] || 0) ? '#ffd700' : '#666',
                              transition: 'color 0.2s'
                            }}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Trending Row */}
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: 1030, marginBottom: 8 }}>
              <h2 style={{ fontWeight: 400, fontSize: '1.25rem', letterSpacing: 0.2, color: '#d1d1d6', margin: 0 }}>Trending on MatchMyMusic</h2>
              {trendingAlbums.length + trendingSongs.length > 6 && (
                <span style={{ color: '#ff9100', fontWeight: 500, fontSize: '1rem', cursor: 'pointer' }} onClick={() => navigate('/trending-releases')}>more</span>
              )}
            </div>
            <div style={{ width: 1030, height: 2, background: 'linear-gradient(90deg, #333 0%, #444 100%)', marginBottom: 18, opacity: 0.7 }} />
            {(loadingTrendingAlbums || loadingTrendingSongs) ? (
              <div>Chargement...</div>
            ) : (errorTrendingAlbums || errorTrendingSongs) ? (
              <div style={{ color: '#ff3e3e' }}>{errorTrendingAlbums || errorTrendingSongs}</div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: 28, paddingBottom: 8, width: 1030, justifyContent: 'center' }}>
                  {[...trendingAlbums.slice(0, 6), ...newSongs.slice(0, 6 - trendingAlbums.slice(0, 6).length)].map((item, idx) => (
                    <MusicCard key={item.id + (item.title || '')} item={item} type={item.coverUrl ? 'album' : 'song'} />
                  ))}
                </div>
                {/* Étoiles de notation pour Trending */}
                <div style={{ display: 'flex', gap: 28, paddingTop: 8, width: 1030, justifyContent: 'center' }}>
                  {[...trendingAlbums.slice(0, 6), ...newSongs.slice(0, 6 - trendingAlbums.slice(0, 6).length)].map((item, idx) => (
                    <div key={`trending-rating-${item.id}`} style={{ width: 150, display: 'flex', justifyContent: 'center' }}>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => {
                              handleSetRating(item.coverUrl ? 'album' : 'song', item.id, star);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: 0,
                              fontSize: '14px',
                              color: star <= (rating[`${item.coverUrl ? 'album' : 'song'}-${item.id}`] || 0) ? '#ffd700' : '#666',
                              transition: 'color 0.2s'
                            }}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}