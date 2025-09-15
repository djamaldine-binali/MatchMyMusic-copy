import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'unread'
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, [currentPage, activeTab]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/notifications?page=${currentPage}&pageSize=20&unreadOnly=${activeTab === 'unread'}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setTotalPages(Math.ceil(data.total / 20));
      } else {
        throw new Error('Erreur lors du chargement des notifications');
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Erreur lors du chargement des notifications');
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications/unread-count', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Mettre à jour l'état local
        setNotifications(prev => prev.map(notif => 
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        ));
        // Recharger le compteur de notifications non lues
        await loadUnreadCount();
        toast.success('Notification marquée comme lue');
      } else {
        throw new Error('Erreur lors de la mise à jour');
      }
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Marquer toutes les notifications comme lues localement
        setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
        setUnreadCount(0);
        toast.success('Toutes les notifications ont été marquées comme lues');
      } else {
        throw new Error('Erreur lors de la mise à jour');
      }
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Supprimer la notification de l'état local
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
        toast.success('Notification supprimée');
      } else {
        throw new Error('Erreur lors de la suppression');
      }
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la suppression');
    }
  };

  const deleteReadNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications/read', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Supprimer toutes les notifications lues de l'état local
        setNotifications(prev => prev.filter(notif => !notif.isRead));
        toast.success('Toutes les notifications lues ont été supprimées');
      } else {
        throw new Error('Erreur lors de la suppression');
      }
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la suppression');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 60) {
      return `Il y a ${diffMinutes} min`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours}h`;
    } else if (diffDays < 7) {
      return `Il y a ${diffDays}j`;
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  };

  // Gérer les clics sur les notifications
  const handleNotificationClick = (notification) => {
    try {
      if (notification.data) {
        const data = JSON.parse(notification.data);
        
        // Navigation vers la page admin des signalements
        if (data.actionType === 'navigate_to_reports' && data.targetPage === '/admin') {
          // Stocker l'onglet cible dans le localStorage pour la page admin
          localStorage.setItem('adminTargetTab', data.targetTab || 'reports');
          navigate('/admin');
          return;
        }
        
        // Navigation vers les matches (pour les notifications de nouveaux matches)
        if (data.matchId) {
          navigate('/matches');
          return;
        }
        
        // Navigation vers le chat (pour les notifications de messages)
        if (data.conversationId) {
          // Déclencher l'ouverture du chat
          const event = new CustomEvent('openChatConversation', {
            detail: { conversationId: data.conversationId }
          });
          window.dispatchEvent(event);
          return;
        }
      }
      
      // Par défaut, marquer comme lu
      if (!notification.isRead) {
        markAsRead(notification.id);
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
      // En cas d'erreur, marquer comme lu
      if (!notification.isRead) {
        markAsRead(notification.id);
      }
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_match':
        return '🎉';
      case 'new_message':
        return '💬';
      case 'user_report':
        return '⚠️';
      case 'system':
        return '🔔';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'new_match':
        return '#ff9100';
      case 'new_message':
        return '#4a90e2';
      case 'user_report':
        return '#ff4444';
      case 'system':
        return '#4caf50';
      default:
        return '#999';
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#18151c' }}>
        <Header />
        <main style={{ maxWidth: 1024, margin: '0 auto', padding: '24px 16px', color: '#fff' }}>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            Chargement des notifications...
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
          Notifications
        </h1>

        {/* Onglets et actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{
            display: 'flex',
            gap: '2px',
            background: '#333',
            borderRadius: '8px',
            padding: '4px'
          }}>
            <button
              onClick={() => {
                setActiveTab('all');
                setCurrentPage(1);
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                background: activeTab === 'all' ? '#ff9100' : 'transparent',
                color: activeTab === 'all' ? '#000' : '#fff',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem'
              }}
            >
              Toutes
            </button>
            <button
              onClick={() => {
                setActiveTab('unread');
                setCurrentPage(1);
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                background: activeTab === 'unread' ? '#ff9100' : 'transparent',
                color: activeTab === 'unread' ? '#000' : '#fff',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem'
              }}
            >
              Non lues ({unreadCount})
            </button>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #ff9100',
                  background: 'transparent',
                  color: '#ff9100',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.9rem'
                }}
              >
                Tout marquer comme lu
              </button>
            )}
            <button
              onClick={deleteReadNotifications}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #ff4444',
                background: 'transparent',
                color: '#ff4444',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem'
              }}
            >
              Supprimer les lues
            </button>
          </div>
        </div>

        {/* Liste des notifications */}
        {notifications.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#999',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '16px' }}>
              {activeTab === 'unread' ? '🔕' : '📭'}
            </div>
            <div style={{ fontSize: '1.2rem', marginBottom: '8px' }}>
              {activeTab === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
            </div>
            <div style={{ opacity: 0.7 }}>
              {activeTab === 'unread' 
                ? 'Vous êtes à jour avec toutes vos notifications !'
                : 'Les notifications apparaîtront ici quand vous aurez de nouveaux matches ou messages.'
              }
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                style={{
                  background: notification.isRead ? 'rgba(255,255,255,0.04)' : 'rgba(255,145,0,0.1)',
                  borderRadius: '12px',
                  padding: '20px',
                  border: notification.isRead 
                    ? '1px solid rgba(255,255,255,0.08)' 
                    : '1px solid rgba(255,145,0,0.3)',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!notification.isRead) {
                    e.target.style.background = 'rgba(255,145,0,0.15)';
                  } else {
                    e.target.style.background = 'rgba(255,255,255,0.08)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!notification.isRead) {
                    e.target.style.background = 'rgba(255,145,0,0.1)';
                  } else {
                    e.target.style.background = 'rgba(255,255,255,0.04)';
                  }
                }}
              >
                {/* Indicateur de lecture */}
                {!notification.isRead && (
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#ff9100'
                  }} />
                )}

                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px'
                }}>
                  <div style={{
                    fontSize: '2rem',
                    color: getNotificationColor(notification.type)
                  }}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontWeight: '600',
                      fontSize: '1.1rem',
                      marginBottom: '8px',
                      color: notification.isRead ? '#ccc' : '#fff'
                    }}>
                      {notification.title}
                    </div>
                    
                    <div style={{
                      color: notification.isRead ? '#999' : '#ccc',
                      marginBottom: '12px',
                      lineHeight: '1.5'
                    }}>
                      {notification.message}
                    </div>
                    
                    <div style={{
                      fontSize: '0.8rem',
                      color: '#666'
                    }}>
                      {formatDate(notification.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  justifyContent: 'flex-end',
                  marginTop: '16px'
                }}>
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '4px',
                        border: '1px solid #ff9100',
                        background: 'transparent',
                        color: '#ff9100',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: '500'
                      }}
                    >
                      Marquer comme lu
                    </button>
                  )}
                  
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '4px',
                      border: '1px solid #ff4444',
                      background: 'transparent',
                      color: '#ff4444',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: '500'
                    }}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '30px'
          }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: 'none',
                  background: currentPage === page ? '#ff9100' : '#333',
                  color: currentPage === page ? '#000' : '#fff',
                  cursor: 'pointer'
                }}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 