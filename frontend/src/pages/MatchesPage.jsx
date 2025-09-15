import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import UserActions from '../components/UserActions';

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState(new Set());

  useEffect(() => {
    loadMatches();
    loadBlockedUsers();
  }, []);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/matches', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMatches(data.matches || []);
      } else {
        throw new Error('Erreur lors du chargement des matches');
      }
    } catch (error) {
      console.error('Error loading matches:', error);
      toast.error('Erreur lors du chargement des matches');
    } finally {
      setLoading(false);
    }
  };

  const loadBlockedUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/blocks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const blockedIds = new Set(data.blockedUsers.map(block => block.blockedUser.id));
        setBlockedUsers(blockedIds);
      }
    } catch (error) {
      console.error('Error loading blocked users:', error);
    }
  };

  const openChatWithMatch = async (match) => {
    try {
      const token = localStorage.getItem('token');
      
      // Créer ou récupérer la conversation pour ce match
      const response = await fetch(`/api/chat/match/${match.matchId}/conversation`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Ouvrir le chat flottant avec cette conversation
        // On va utiliser un événement personnalisé pour communiquer avec ChatButton
        const event = new CustomEvent('openChatConversation', {
          detail: { conversationId: data.conversation.id }
        });
        window.dispatchEvent(event);
      } else {
        throw new Error('Failed to create conversation');
      }
    } catch (error) {
      console.error('Error opening chat:', error);
      toast.error('Erreur lors de l\'ouverture du chat');
    }
  };

  const handleBlockUser = async (userId, username) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/blocks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          blockedId: userId,
          reason: 'Blocage depuis la page des matches'
        })
      });

      if (response.ok) {
        // Mettre à jour la liste des utilisateurs bloqués
        setBlockedUsers(prev => new Set([...prev, userId]));
        // Recharger les matches pour exclure l'utilisateur bloqué
        await loadMatches();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors du blocage');
      }
    } catch (error) {
      throw error;
    }
  };

  const handleUnblockUser = async (userId, username) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/blocks/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Mettre à jour la liste des utilisateurs bloqués
        setBlockedUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
        // Recharger les matches pour inclure l'utilisateur débloqué
        await loadMatches();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors du déblocage');
      }
    } catch (error) {
      throw error;
    }
  };

  const openMatchDetails = (match) => {
    setSelectedMatch(match);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMatch(null);
  };

  // Filtrer les matches pour exclure les utilisateurs bloqués
  const filteredMatches = matches.filter(match => !blockedUsers.has(match.userId));

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#18151c' }}>
        <Header />
        <main style={{ maxWidth: 1024, margin: '0 auto', padding: '24px 16px', color: '#fff' }}>
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 0',
            color: '#fff'
          }}>
            Chargement des matches...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#18151c' }}>
      <Header />
      <main style={{ maxWidth: 1024, margin: '0 auto', padding: '24px 16px', color: '#fff' }}>
        <h1 style={{ 
          color: '#ff9100', 
          marginBottom: '30px', 
          textAlign: 'center',
          fontSize: '2.5rem'
        }}>
          Vos Matches
        </h1>

        {filteredMatches.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 0',
            color: '#fff',
            opacity: 0.8,
            fontSize: '1.1rem'
          }}>
            Aucun match pour le moment. Continuez à noter et aimer de la musique pour découvrir des utilisateurs avec des goûts similaires !
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {filteredMatches.map((match) => (
              <div
                key={match.matchId}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.08)';
                  e.target.style.borderColor = 'rgba(255,145,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.04)';
                  e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: '#ff9100',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '16px',
                    color: '#18151c',
                    fontWeight: '700',
                    fontSize: '1.2rem'
                  }}>
                    {match.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{
                      fontWeight: '700',
                      fontSize: '1.1rem',
                      marginBottom: '4px',
                      color: '#fff'
                    }}>
                      {match.username}
                    </div>
                    <div style={{
                      opacity: 0.8,
                      fontSize: '0.9rem',
                      color: '#ccc'
                    }}>
                      {match.email}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    marginBottom: '16px'
                  }}>
                    <div style={{
                      background: '#ff9100',
                      color: '#18151c',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontWeight: '600',
                      fontSize: '0.9rem'
                    }}>
                      {match.commonFavorites} favoris
                    </div>
                    <div style={{
                      background: '#ff9100',
                      color: '#18151c',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontWeight: '600',
                      fontSize: '0.9rem'
                    }}>
                      {match.commonRatings} notes
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      color: '#ff9100',
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      marginBottom: '4px'
                    }}>
                      Score: {match.matchScore}
                    </div>
                    <div style={{
                      opacity: 0.8,
                      fontSize: '0.9rem',
                      marginBottom: '16px'
                    }}>
                      Cliquez pour voir les détails
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '10px',
                  marginBottom: '16px'
                }}>
                  <button
                    onClick={() => openMatchDetails(match)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#ff9100',
                      color: '#18151c',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#e67e00';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#ff9100';
                    }}
                  >
                    Voir détails
                  </button>
                  <button
                    onClick={() => openChatWithMatch(match)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #ff9100',
                      background: 'transparent',
                      color: '#ff9100',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#ff9100';
                      e.target.style.color = '#18151c';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#ff9100';
                    }}
                  >
                    Chat
                  </button>
                </div>

                {/* Actions sur l'utilisateur */}
                <UserActions
                  userId={match.userId}
                  username={match.username}
                  onBlock={handleBlockUser}
                  onUnblock={handleUnblockUser}
                  isBlocked={blockedUsers.has(match.userId)}
                  isTargetAdmin={match.isAdmin || false}
                />
              </div>
            ))}
          </div>
        )}

        {/* Modal des détails du match */}
        {showModal && selectedMatch && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 9998,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              background: '#000',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 12,
              padding: 24,
              minWidth: 600,
              maxWidth: 800,
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20
              }}>
                <h2 style={{
                  color: '#fff',
                  margin: 0
                }}>
                  Match avec {selectedMatch.username}
                </h2>
                <button
                  onClick={closeModal}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#fff',
                    fontSize: '24px',
                    cursor: 'pointer'
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ marginBottom: 24 }}>
                <div style={{
                  display: 'flex',
                  gap: 16,
                  marginBottom: 16
                }}>
                  <div style={{
                    background: '#ff9100',
                    color: '#18151c',
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontWeight: 600
                  }}>
                    {selectedMatch.commonFavorites} favoris en commun
                  </div>
                  <div style={{
                    background: '#ff9100',
                    color: '#18151c',
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontWeight: 600
                  }}>
                    {selectedMatch.commonRatings} notes en commun
                  </div>
                </div>
                <div style={{
                  color: '#ff9100',
                  fontSize: '1.2rem',
                  fontWeight: '700'
                }}>
                  Score de match: {selectedMatch.matchScore}
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '15px',
                justifyContent: 'center'
              }}>
                <button
                  onClick={() => {
                    closeModal();
                    openChatWithMatch(selectedMatch);
                  }}
                  style={{
                    background: '#4a90e2',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '1rem',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#357abd';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#4a90e2';
                  }}
                >
                  Ouvrir le chat
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 