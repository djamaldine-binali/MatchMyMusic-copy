import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Header from '../components/Header';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('blocked');
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlockedUsers();
  }, []);

  const loadBlockedUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/blocks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBlockedUsers(data.blockedUsers || []);
      } else {
        throw new Error('Erreur lors du chargement des utilisateurs bloqués');
      }
    } catch (error) {
      console.error('Error loading blocked users:', error);
      toast.error('Erreur lors du chargement des utilisateurs bloqués');
    } finally {
      setLoading(false);
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
        toast.success(`Utilisateur ${username} débloqué avec succès`);
        // Recharger la liste des utilisateurs bloqués
        await loadBlockedUsers();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors du déblocage');
      }
    } catch (error) {
      toast.error(error.message || 'Erreur lors du déblocage');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#18151c' }}>
        <Header />
        <main style={{ maxWidth: 1024, margin: '0 auto', padding: '24px 16px', color: '#fff' }}>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            Chargement des paramètres...
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
          Paramètres
        </h1>

        {/* Onglets */}
        <div style={{
          display: 'flex',
          gap: '2px',
          background: '#333',
          borderRadius: '8px',
          padding: '4px',
          marginBottom: '30px',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => setActiveTab('blocked')}
            style={{
              padding: '12px 24px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'blocked' ? '#ff9100' : 'transparent',
              color: activeTab === 'blocked' ? '#000' : '#fff',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}
          >
            Utilisateurs bloqués
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            style={{
              padding: '12px 24px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'privacy' ? '#ff9100' : 'transparent',
              color: activeTab === 'privacy' ? '#000' : '#fff',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}
          >
            Confidentialité
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            style={{
              padding: '12px 24px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'notifications' ? '#ff9100' : 'transparent',
              color: activeTab === 'notifications' ? '#000' : '#fff',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}
          >
            Notifications
          </button>
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'blocked' && (
          <div>
            <h2 style={{ color: '#ff9100', marginBottom: '20px' }}>
              Utilisateurs bloqués ({blockedUsers.length})
            </h2>
            
            {blockedUsers.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                color: '#999',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.08)'
              }}>
                <div style={{ fontSize: '1.2rem', marginBottom: '12px' }}>
                  Aucun utilisateur bloqué
                </div>
                <div style={{ opacity: 0.7 }}>
                  Les utilisateurs que vous bloquez n'apparaîtront plus dans vos matches et ne pourront plus vous contacter.
                </div>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gap: '16px'
              }}>
                {blockedUsers.map((block) => (
                  <div
                    key={block.id}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      borderRadius: '12px',
                      padding: '20px',
                      border: '1px solid rgba(255,255,255,0.08)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px'
                    }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: '#ff4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: '700',
                        fontSize: '1.2rem'
                      }}>
                        {block.blockedUser.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{
                          fontWeight: '600',
                          fontSize: '1.1rem',
                          marginBottom: '4px',
                          color: '#fff'
                        }}>
                          {block.blockedUser.username}
                        </div>
                        <div style={{
                          fontSize: '0.9rem',
                          color: '#ccc',
                          marginBottom: '4px'
                        }}>
                          Bloqué le {formatDate(block.blockedAt)}
                        </div>
                        {block.reason && (
                          <div style={{
                            fontSize: '0.8rem',
                            color: '#ffaa00',
                            fontStyle: 'italic'
                          }}>
                            Raison: {block.reason}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleUnblockUser(block.blockedUser.id, block.blockedUser.username)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
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
                      Débloquer
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'privacy' && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#999',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <div style={{ fontSize: '1.2rem', marginBottom: '12px', color: '#ff9100' }}>
              Paramètres de confidentialité
            </div>
            <div style={{ opacity: 0.7 }}>
              Les paramètres de confidentialité seront bientôt disponibles.
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#999',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <div style={{ fontSize: '1.2rem', marginBottom: '12px', color: '#ff9100' }}>
              Paramètres de notifications
            </div>
            <div style={{ opacity: 0.7 }}>
              Les paramètres de notifications seront bientôt disponibles.
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 