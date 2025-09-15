import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimatedLogo from './AnimatedLogo';

export default function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await fetch('/api/users/profile', {
            headers: { 'Authorization': 'Bearer ' + token }
          });
          if (res.ok) {
            const data = await res.json();
            setIsAdmin(data.user.isAdmin || false);
            setIsLoggedIn(true);
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
        }
      }
    };
    
    checkAdminStatus();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/users/profile', {
        headers: {
          'Authorization': 'Bearer ' + token,
        },
      })
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Failed to fetch user profile');
        })
        .then(data => {
          setUser(data.user);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching user profile:', err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/notifications/unread-count', {
        headers: {
          'Authorization': 'Bearer ' + token,
        },
      })
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Failed to fetch unread count');
        })
        .then(data => {
          setUnreadCount(data.unreadCount || 0);
        })
        .catch(err => {
          console.error('Error fetching unread count:', err);
        });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsMenuOpen(false);
    navigate('/');
  };

  const handleMenuClick = (path) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  if (loading) {
    return (
      <header style={{
        width: '100%',
        background: '#100D14',
        display: 'flex',
        alignItems: 'center',
        padding: '0 0 0 32px',
        height: 80,
        boxSizing: 'border-box',
        position: 'relative',
        borderBottom: '0.5px solid #888888',
        zIndex: 1000,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <AnimatedLogo size="3xl" showText={false} />
        </div>
      </header>
    );
  }

  return (
    <header style={{
      width: '100%',
      background: '#100D14',
      display: 'flex',
      alignItems: 'center',
      padding: '0 32px',
      height: 80,
      boxSizing: 'border-box',
      position: 'relative',
      borderBottom: '0.5px solid #888888',
      zIndex: 1000,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <AnimatedLogo size="3xl" showText={false} />
      </div>

      {/* Boutons de navigation */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        flex: 1,
        marginLeft: '48px',
        marginRight: '48px'
      }}>
        {isLoggedIn && (
          <>
            {/* Section Navigation principale */}
            <div style={{
              display: 'flex',
              gap: '48px',
              alignItems: 'center'
            }}>
              <button
                onClick={() => navigate('/main')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                }}
              >
                Accueil
              </button>
              <button
                onClick={() => navigate('/matches')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.05)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                }}
              >
                Matches
              </button>
            </div>

            {/* Espacement uniforme */}
            <div style={{ width: '48px' }}></div>

            {/* Section Notifications */}
            <button
              onClick={() => navigate('/notifications')}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                padding: '8px 16px',
                borderRadius: '6px',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
              }}
            >
              Notifications
              {/* Indicateur de notifications non lues */}
              {unreadCount > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  background: '#ff4444',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '0.7rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </div>
              )}
            </button>

            {/* Espacement uniforme */}
            <div style={{ width: '48px' }}></div>

            {/* Section Admin (si admin) */}
            {isAdmin ? (
              <button
                onClick={() => navigate('/admin')}
                style={{
                  background: 'rgba(255,145,0,0.1)',
                  border: '1px solid rgba(255,145,0,0.3)',
                  color: '#ff9100',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255,145,0,0.2)';
                  e.target.style.borderColor = 'rgba(255,145,0,0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255,145,0,0.1)';
                  e.target.style.borderColor = 'rgba(255,145,0,0.3)';
                }}
              >
                Admin
              </button>
            ) : (
              /* Espaceur pour maintenir l'équilibre quand pas d'admin */
              <div style={{ width: '80px' }}></div>
            )}
          </>
        )}
      </div>

      {/* User Profile Section (when logged in) */}
      {user ? (
        <div style={{ 
          marginLeft: 'auto', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 12,
          position: 'relative'
        }}>
          {/* Profile Picture */}
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: '#ff9100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#18151c',
            fontWeight: 700,
            fontSize: '1.1rem',
          }}>
            {user.profilePic ? (
              <img 
                src={user.profilePic} 
                alt={user.username}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              user.username.charAt(0).toUpperCase()
            )}
          </div>

          {/* Username */}
          <span style={{
            color: '#fff',
            fontWeight: 600,
            fontSize: '1rem',
          }}>
            {user.username}
          </span>

          {/* Dropdown Arrow */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: '#ff9100',
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              transition: 'transform 0.2s',
              transform: isMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              background: '#1a1a1a',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '8px 0',
              minWidth: '200px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              zIndex: 1000,
            }}>
              {/* Section Navigation principale */}
              <div style={{ padding: '0 0 8px 0' }}>
                <button
                  onClick={() => handleMenuClick('/main')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '1rem',
                    padding: '12px 18px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    width: '100%',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.target.style.background = 'rgba(255,145,0,0.1)'}
                  onMouseLeave={e => e.target.style.background = 'none'}
                >
                  Accueil
                </button>
                <button
                  onClick={() => handleMenuClick('/matches')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '1rem',
                    padding: '12px 18px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    width: '100%',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.target.style.background = 'rgba(255,145,0,0.1)'}
                  onMouseLeave={e => e.target.style.background = 'none'}
                >
                  Matches
                </button>
                <button
                  onClick={() => handleMenuClick('/notifications')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '1rem',
                    padding: '12px 18px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    width: '100%',
                    transition: 'background 0.15s',
                    position: 'relative'
                  }}
                  onMouseEnter={e => e.target.style.background = 'rgba(255,145,0,0.1)'}
                  onMouseLeave={e => e.target.style.background = 'none'}
                >
                  Notifications
                  {/* Indicateur de notifications non lues dans le menu */}
                  {unreadCount > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      right: '18px',
                      transform: 'translateY(-50%)',
                      background: '#ff4444',
                      color: '#fff',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      fontSize: '0.7rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold'
                    }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                  )}
                </button>
              </div>

              {/* Séparateur */}
              <div style={{
                height: 1,
                background: 'rgba(255,255,255,0.1)',
                margin: '8px 0',
              }} />

              {/* Section Profil et Paramètres */}
              <div style={{ padding: '0 0 8px 0' }}>
                <button
                  onClick={() => handleMenuClick('/profile')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '1rem',
                    padding: '12px 18px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    width: '100%',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.target.style.background = 'rgba(255,145,0,0.1)'}
                  onMouseLeave={e => e.target.style.background = 'none'}
                >
                  Profile
                </button>
                <button
                  onClick={() => handleMenuClick('/settings')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '1rem',
                    padding: '12px 18px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    width: '100%',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.target.style.background = 'rgba(255,145,0,0.1)'}
                  onMouseLeave={e => e.target.style.background = 'none'}
                >
                  Paramètres
                </button>
              </div>

              {/* Séparateur */}
              <div style={{
                height: 1,
                background: 'rgba(255,255,255,0.1)',
                margin: '8px 0',
              }} />

              {/* Section Logout */}
              <div style={{ padding: '0' }}>
                <button
                  onClick={handleLogout}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ff3e3e',
                    fontWeight: 600,
                    fontSize: '1rem',
                    padding: '12px 18px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    width: '100%',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.target.style.background = 'rgba(255,62,62,0.1)'}
                  onMouseLeave={e => e.target.style.background = 'none'}
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Wave line (only when not logged in) */
        <svg
          width="100%"
          height="40"
          viewBox="0 0 1200 40"
          style={{ marginLeft: 36, flex: 1, minWidth: 0 }}
          preserveAspectRatio="none"
        >
          <path
            d="M40,20 Q180,0 320,20 T600,20 T880,20 T1160,20"
            stroke="#ff9100"
            strokeWidth="1.2"
            fill="none"
            opacity="0.95"
          />
        </svg>
      )}
    </header>
  );
}
