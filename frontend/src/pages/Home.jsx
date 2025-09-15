import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const trendingQueries = [
  'taylor swift',
  'drake',
  'beyoncé',
  'rock',
  'pop',
  'ed sheeran',
  'dua lipa',
  'kendrick lamar',
  'billie eilish',
  'the weeknd',
  'ariana grande',
  'coldplay',
  'jazz',
  'classical',
  'hip hop',
  'metal',
  'electronic',
  'adele',
  'rihanna',
  'bruno mars',
];

function getRandomQuery() {
  return trendingQueries[Math.floor(Math.random() * trendingQueries.length)];
}

export default function Home() {
  const navigate = useNavigate();
  const [topRated, setTopRated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    const fetchTopRated = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/top-ratings');
        const data = await res.json();
        setTopRated(Array.isArray(data) ? data.slice(0, 6) : []);
      } catch (err) {
        setTopRated([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTopRated();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    try {
      // Rechercher d'abord les albums
      const albumRes = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}&type=album`);
      const albumData = await albumRes.json();
      
      // Rechercher ensuite les tracks
      const trackRes = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}&type=track`);
      const trackData = await trackRes.json();

      // Combiner et limiter les résultats
      const combinedResults = [
        ...(albumData.results || []).slice(0, 5),
        ...(trackData.results || []).slice(0, 5)
      ];

      setSearchResults(combinedResults);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Erreur de recherche:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleResultClick = (result) => {
    // Naviguer vers la page de détail de la musique
    // Pour l'instant, on peut rediriger vers la page d'inscription
    // ou créer une page de détail accessible sans connexion
    navigate('/register');
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  // Filter albums to only show one per artist
  const uniqueAlbums = [];
  const artistCount = {};
  for (const album of topRated) {
    if (!artistCount[album.album.artist]) artistCount[album.album.artist] = 0;
    if (artistCount[album.album.artist] < 2) {
      uniqueAlbums.push(album);
      artistCount[album.album.artist]++;
    }
  }

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: 'linear-gradient(135deg, #232526 0%, #414345 100%)', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar (header mimic) */}
      <div style={{
        width: '100%',
        background: '#000',
        color: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        zIndex: 1000,
        padding: 0,
        position: 'relative',
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '28px 32px',
        }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, letterSpacing: '1.5px' }}>MatchMyMusic</h2>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button
              onClick={() => navigate('/login')}
              style={{
              background: 'transparent',
              color: 'white',
              border: '0.5px solid #666',
              borderRadius: '8px',
              padding: '5px 18px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s, color 0.2s, transform 0.1s',
              outline: 'none',
            }}
            onMouseDown={(e) => {
              e.target.style.transform = 'scale(0.95)';
            }}
            onMouseUp={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#333';
              e.target.style.borderColor = '#999';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.background = 'transparent';
              e.target.style.borderColor = '#666';
            }}
            >Connexion</button>
            <button style={{
              background: 'linear-gradient(180deg, #ff9100 70%, #ff6d00 100%)',
              color: '#fff',
              border: '1.5px solid #ff8500',
              borderRadius: '8px',
              padding: '5px 18px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s ease, transform 0.1s',
              outline: 'none',
            }}
            onClick={() => navigate('/register')}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(180deg, #e67e00 70%, #d65a00 100%)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'linear-gradient(180deg, #ff9100 70%, #ff6d00 100%)';
            }}
            onMouseDown={(e) => {
              e.target.style.transform = 'scale(0.95)';
            }}
            onMouseUp={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
            >Inscription</button>
          </div>
        </div>
      </div>
      {/* Top half: white background with big headline */}
      <div style={{
        height: '100vh',
        background: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        boxSizing: 'border-box',
        paddingTop: 0,
        paddingBottom: 0,
        position: 'relative',
        zIndex: 2,
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: 1400,
          height: '80vh',
          minHeight: 0,
          position: 'relative',
        }}>
          {/* Orange waveform background */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            width: '100%',
            height: '200px',
            transform: 'translateY(-50%)',
            zIndex: 1,
            opacity: 0.25,
          }}>
            <svg viewBox="0 0 1440 200" width="100%" height="100%" preserveAspectRatio="none" style={{ display: 'block' }}>
              <path d="M0,100 Q180,50 360,100 Q540,150 720,100 Q900,50 1080,100 Q1260,150 1440,100" stroke="#ff9100" strokeWidth="3" fill="none" opacity="0.95" />
            </svg>
          </div>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <span style={{
              fontSize: '9vw',
              fontWeight: 900,
              color: '#000',
              textAlign: 'center',
              lineHeight: 0.9,
              margin: 0,
              padding: 0,
              width: '100%',
              display: 'block',
              textTransform: 'uppercase',
              fontFamily: "'Montserrat', 'Tahoma', sans-serif",
              maxWidth: 1400,
              textWrap: 'balance',
              letterSpacing: '-2px',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              textRendering: 'geometricPrecision',
              WebkitTextStroke: '0.5px #000',
            }}>
              LÀ OÙ LA
            </span>
            <span style={{
              fontSize: '9vw',
              fontWeight: 900,
              color: '#000',
              textAlign: 'center',
              lineHeight: 0.9,
              margin: '0 0 2vw 0',
              padding: 0,
              width: '100%',
              display: 'block',
              textTransform: 'uppercase',
              fontFamily: "'Montserrat', 'Tahoma', sans-serif",
              maxWidth: 1400,
              textWrap: 'balance',
              letterSpacing: '-2px',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              textRendering: 'geometricPrecision',
              WebkitTextStroke: '0.5px #000',
            }}>
              MUSIQUE
            </span>
            <span style={{
              fontSize: '9vw',
              fontWeight: 900,
              color: '#000',
              textAlign: 'center',
              lineHeight: 0.9,
              margin: 0,
              padding: 0,
              width: '100%',
              display: 'block',
              textTransform: 'uppercase',
              fontFamily: "'Montserrat', 'Tahoma', sans-serif",
              maxWidth: 1400,
              textWrap: 'balance',
              letterSpacing: '-2px',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              textRendering: 'geometricPrecision',
              WebkitTextStroke: '0.5px #000',
            }}>
              RAPPROCHE
            </span>
            
            {/* Barre de recherche */}
            <div style={{ 
              marginTop: '3vw', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              position: 'relative',
              zIndex: 3
            }}>
              <form onSubmit={handleSearch} style={{ 
                display: 'flex', 
                gap: '12px', 
                alignItems: 'center',
                width: '100%',
                maxWidth: '600px',
                position: 'relative'
              }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher une musique ou un album..."
                  style={{
                    flex: 1,
                    padding: '16px 20px',
                    borderRadius: '50px',
                    border: '2px solid #e0e0e0',
                    background: '#fff',
                    color: '#333',
                    fontSize: '1.1rem',
                    fontWeight: '500',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    fontFamily: "'Montserrat', 'Tahoma', sans-serif"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#ff9100';
                    e.target.style.boxShadow = '0 6px 25px rgba(255,145,0,0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
                  }}
                />
                <button
                  type="submit"
                  disabled={searchLoading}
                  style={{
                    background: 'linear-gradient(180deg, #ff9100 70%, #ff6d00 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50px',
                    padding: '16px 24px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 20px rgba(255,145,0,0.3)',
                    fontFamily: "'Montserrat', 'Tahoma', sans-serif",
                    minWidth: '120px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 25px rgba(255,145,0,0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 20px rgba(255,145,0,0.3)';
                  }}
                >
                  {searchLoading ? 'Recherche...' : 'Rechercher'}
                </button>
              </form>

              {/* Résultats de recherche */}
              {showSearchResults && searchResults.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '100%',
                  maxWidth: '600px',
                  background: '#fff',
                  borderRadius: '16px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                  border: '1px solid #e0e0e0',
                  marginTop: '12px',
                  zIndex: 1000,
                  maxHeight: '400px',
                  overflow: 'auto'
                }}>
                  <div style={{
                    padding: '16px',
                    borderBottom: '1px solid #f0f0f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ 
                      fontSize: '1rem', 
                      fontWeight: '600', 
                      color: '#333' 
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
                      onMouseEnter={(e) => e.target.style.color = '#666'}
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
                        borderBottom: index < searchResults.length - 1 ? '1px solid #f0f0f0' : 'none',
                        cursor: 'pointer',
                        transition: 'background 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#f8f9fa'}
                      onMouseLeave={(e) => e.target.style.background = '#fff'}
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
                          color: '#333',
                          marginBottom: '4px'
                        }}>
                          {result.title}
                        </div>
                        <div style={{
                          fontSize: '0.9rem',
                          color: '#666'
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
                        background: '#fff3e0',
                        borderRadius: '12px',
                        border: '1px solid #ffcc80'
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
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '100%',
                  maxWidth: '600px',
                  background: '#fff',
                  borderRadius: '16px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                  border: '1px solid #e0e0e0',
                  marginTop: '12px',
                  zIndex: 1000,
                  padding: '20px',
                  textAlign: 'center'
                }}>
                  <div style={{ color: '#666', fontSize: '1rem' }}>
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

            <div style={{ marginTop: '2vw', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{
                color: '#000',
                fontSize: '1.6vw',
                fontWeight: '900',
                fontFamily: "'Montserrat', 'Tahoma', sans-serif",
                marginBottom: '1.2vw',
                letterSpacing: '0.1px',
                textAlign: 'center',
              }}>
                Venez à votre rythme
              </span>
              <button
                style={{
                  background: 'linear-gradient(180deg, #ff9100 70%, #ff6d00 100%)',
                  color: '#fff',
                  border: '1.5px solid #ff8500',
                  borderRadius: '14px',
                  padding: '0.45em 2.2em',
                  fontSize: '1.1vw',
                  fontWeight: '800',
                  fontFamily: "'Montserrat', 'Tahoma', sans-serif",
                  letterSpacing: '0.5px',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                  outline: 'none',
                  borderStyle: 'solid',
                  borderWidth: '1.5px',
                }}
                onClick={() => navigate('/register')}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(180deg, #e67e00 70%, #d65a00 100%)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(180deg, #ff9100 70%, #ff6d00 100%)';
                }}
              >S'inscrire</button>
            </div>
          </div>
        </div>
        {/* Curved SVG separator: filled, so black background starts right at the curve */}
        <div style={{ width: '100%', lineHeight: 0, position: 'absolute', bottom: 0, left: 0, zIndex: 3 }}>
          <svg viewBox="0 0 1440 80" width="100%" height="80" preserveAspectRatio="none" style={{ display: 'block' }}>
            <path d="M0,0 Q720,80 1440,0 L1440,80 L0,80 Z" fill="#000" />
          </svg>
        </div>
      </div>
      {/* Bottom section: dark background with music cards, only visible on scroll */}
      <div style={{
        minHeight: '100vh',
        background: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: '100%',
        boxSizing: 'border-box',
        paddingBottom: 48,
        marginTop: '-1px',
      }}>
        {loading ? (
          <div style={{ color: '#bdbdbd', fontSize: '1.2rem', margin: '32px 0' }}>Loading albums...</div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 40,
              justifyItems: 'center',
              alignItems: 'center',
              width: '100%',
              maxWidth: 1100,
              margin: '0 auto',
            }}
          >
            {topRated.length > 0 ? (
              topRated.map((item, idx) => (
                <div
                  key={item.id || idx}
                  style={{
                    position: 'relative',
                    background: 'rgba(255,255,255,0.10)',
                    borderRadius: 28,
                    padding: 0,
                    width: 240,
                    height: 320,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    boxShadow: '0 8px 32px 0 rgba(31,38,135,0.18)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1.5px solid rgba(255,255,255,0.18)',
                    overflow: 'hidden',
                    transition: 'transform 0.18s cubic-bezier(.4,0,.2,1), box-shadow 0.18s cubic-bezier(.4,0,.2,1)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'scale(1.045)';
                    e.currentTarget.style.boxShadow = '0 12px 36px 0 rgba(31,38,135,0.28)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(31,38,135,0.18)';
                  }}
                >
                  <div style={{ position: 'relative', width: '100%', height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                      src={item.album.cover}
                      alt={item.album.title}
                      style={{ width: 180, height: 180, borderRadius: 20, objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
                      onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/180?text=No+Image'; }}
                    />
                  </div>
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    padding: '12px 18px 14px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}>
                    <div style={{
                      position: 'absolute',
                      left: 12,
                      right: 12,
                      bottom: 8,
                      height: 54,
                      borderRadius: 16,
                      background: 'rgba(30,30,30,0.38)',
                      backdropFilter: 'blur(6px)',
                      WebkitBackdropFilter: 'blur(6px)',
                      zIndex: 1,
                    }} />
                    <div style={{ color: 'white', fontWeight: 800, fontSize: '1.15rem', textAlign: 'center', marginBottom: 2, textShadow: '0 2px 8px rgba(0,0,0,0.18)', position: 'relative', zIndex: 2 }}>{item.album.title}</div>
                    <div style={{ color: '#e0e0e0', fontSize: '1rem', textAlign: 'center', fontWeight: 500, position: 'relative', zIndex: 2 }}>{item.album.artist}</div>
                    <div style={{ color: '#ff9100', fontWeight: 700, fontSize: '1.05rem', position: 'relative', zIndex: 2, marginTop: 2 }}>
                      {item.user} &middot; <span style={{ color: '#fff', fontWeight: 800 }}>{item.rating.toFixed(1)}★</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Add placeholders if fewer than 6 cards
              Array.from({ length: 6 - uniqueAlbums.slice(0, 6).length }).map((_, idx) => (
                <div
                  key={`placeholder-${idx}`}
                  style={{
                    position: 'relative',
                    background: 'rgba(255,255,255,0.10)',
                    borderRadius: 28,
                    width: 240,
                    height: 320,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 32px 0 rgba(31,38,135,0.10)',
                    border: '1.5px dashed rgba(255,255,255,0.18)',
                    color: '#fff',
                    textAlign: 'center',
                    cursor: 'pointer',
                    fontFamily: "'Montserrat', 'Tahoma', sans-serif",
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    letterSpacing: '0.5px',
                    userSelect: 'none',
                    transition: 'box-shadow 0.18s cubic-bezier(.4,0,.2,1)',
                  }}
                >
                  <div style={{ fontSize: 54, marginBottom: 18, opacity: 0.7 }}>+</div>
                  <div style={{ fontSize: '1.1rem', color: '#fff', opacity: 0.85, marginBottom: 6 }}>
                    Ajoutez votre album préféré ici !
                  </div>
                  <div style={{ fontSize: '0.98rem', color: '#ff9100', opacity: 0.85 }}>
                    (Inscrivez-vous pour participer)
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
