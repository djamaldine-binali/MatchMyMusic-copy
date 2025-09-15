import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

export default function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Charger les conversations de l'utilisateur
  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen]);

  // Charger les messages quand une conversation est sélectionnée
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  // Scroll automatique vers le bas des messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Écouter les événements pour ouvrir le chat depuis les matches
  useEffect(() => {
    const handleOpenChat = (event) => {
      const { conversationId } = event.detail;
      // Trouver la conversation correspondante
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation) {
        setIsOpen(true);
        setSelectedConversation(conversation);
        setMessages([]); // Vider les messages précédents
      }
    };

    window.addEventListener('openChatConversation', handleOpenChat);
    return () => window.removeEventListener('openChatConversation', handleOpenChat);
  }, [conversations]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Veuillez vous connecter pour accéder au chat');
        setIsOpen(false);
        return;
      }

      const res = await fetch('/api/chat/conversations', {
        headers: { 'Authorization': 'Bearer ' + token }
      });

      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      } else {
        toast.error('Erreur lors du chargement des conversations');
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Erreur lors du chargement des conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
        headers: { 'Authorization': 'Bearer ' + token }
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      } else {
        toast.error('Erreur lors du chargement des messages');
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Erreur lors du chargement des messages');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending || !selectedConversation) return;

    try {
      setSending(true);
      const token = localStorage.getItem('token');
      
      const res = await fetch(`/api/chat/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({ content: newMessage.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, data.message]);
        setNewMessage('');
        
        // Mettre à jour la conversation dans la liste
        setConversations(prev => prev.map(conv => 
          conv.id === selectedConversation.id 
            ? { ...conv, lastMessage: data.message, messageCount: conv.messageCount + 1 }
            : conv
        ));
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'Erreur lors de l\'envoi');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  const openChat = (conversation) => {
    setSelectedConversation(conversation);
    setMessages([]); // Vider les messages précédents
  };

  const backToConversations = () => {
    setSelectedConversation(null);
    setMessages([]);
  };

  const formatLastMessage = (message) => {
    if (!message) return 'Aucun message';
    const content = message.content.length > 30 
      ? message.content.substring(0, 30) + '...' 
      : message.content;
    return `${message.sender}: ${content}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <>
      {/* Bouton flottant du chat */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: '#ff9100',
          border: 'none',
          color: '#000',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = 'scale(1.1)';
          e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        }}
        title="Chat avec vos matches"
      >
        💬
      </button>

      {/* Popup des conversations ou du chat */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '20px',
            width: '400px',
            height: '600px',
            background: '#1a1a1a',
            borderRadius: '12px',
            border: '1px solid #333',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            zIndex: 999,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {!selectedConversation ? (
            // Vue des conversations
            <>
              {/* Header des conversations */}
              <div style={{
                padding: '16px',
                borderBottom: '1px solid #333',
                background: '#222'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h3 style={{ margin: 0, color: '#ff9100', fontSize: '1.1rem' }}>
                    Conversations
                  </h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#999',
                      fontSize: '18px',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Liste des conversations */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {loading ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                    Chargement...
                  </div>
                ) : conversations.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                    Aucune conversation pour le moment
                  </div>
                ) : (
                  conversations.map(conversation => (
                    <div
                      key={conversation.id}
                      onClick={() => openChat(conversation)}
                      style={{
                        padding: '16px',
                        borderBottom: '1px solid #333',
                        cursor: 'pointer',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#2a2a2a';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent';
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '8px'
                      }}>
                        <div style={{
                          fontWeight: '600',
                          color: '#fff',
                          fontSize: '1rem'
                        }}>
                          {conversation.otherUser.username}
                        </div>
                        <div style={{
                          fontSize: '0.8rem',
                          color: '#999'
                        }}>
                          {formatDate(conversation.updatedAt)}
                        </div>
                      </div>
                      
                      <div style={{
                        color: '#ccc',
                        fontSize: '0.9rem',
                        marginBottom: '4px'
                      }}>
                        {formatLastMessage(conversation.lastMessage)}
                      </div>
                      
                      <div style={{
                        fontSize: '0.8rem',
                        color: '#666'
                      }}>
                        {conversation.messageCount} message{conversation.messageCount > 1 ? 's' : ''}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            // Vue du chat
            <>
              {/* Header du chat */}
              <div style={{
                padding: '16px',
                borderBottom: '1px solid #333',
                background: '#222'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <button
                    onClick={backToConversations}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ff9100',
                      fontSize: '16px',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    ←
                  </button>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontWeight: '600',
                      color: '#fff',
                      fontSize: '1rem'
                    }}>
                      {selectedConversation.otherUser.username}
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: '#999'
                    }}>
                      {selectedConversation.messageCount} message{selectedConversation.messageCount > 1 ? 's' : ''}
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#999',
                      fontSize: '18px',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Zone des messages */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                {messages.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    color: '#999', 
                    padding: '20px 0',
                    fontStyle: 'italic'
                  }}>
                    Aucun message pour le moment. Commencez la conversation !
                  </div>
                ) : (
                  messages.map((message) => {
                    const isOwnMessage = message.sender.id === parseInt(localStorage.getItem('userId') || '0');
                    
                    return (
                      <div
                        key={message.id}
                        style={{
                          display: 'flex',
                          justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                          marginBottom: '8px'
                        }}
                      >
                        <div style={{
                          maxWidth: '80%',
                          padding: '8px 12px',
                          borderRadius: '16px',
                          background: isOwnMessage ? '#ff9100' : '#333',
                          color: isOwnMessage ? '#000' : '#fff',
                          fontSize: '0.9rem'
                        }}>
                          <div style={{ marginBottom: '4px' }}>
                            {message.content}
                          </div>
                          <div style={{
                            fontSize: '0.7rem',
                            opacity: 0.7,
                            textAlign: 'right'
                          }}>
                            {formatTime(message.createdAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Formulaire d'envoi de message */}
              <form onSubmit={sendMessage} style={{
                padding: '16px',
                borderTop: '1px solid #333',
                display: 'flex',
                gap: '8px'
              }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Tapez votre message..."
                  disabled={sending}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #333',
                    background: '#222',
                    color: '#fff',
                    fontSize: '0.9rem'
                  }}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: newMessage.trim() && !sending ? '#ff9100' : '#666',
                    color: newMessage.trim() && !sending ? '#000' : '#999',
                    cursor: newMessage.trim() && !sending ? 'pointer' : 'not-allowed',
                    fontWeight: '600',
                    fontSize: '0.9rem'
                  }}
                >
                  {sending ? '...' : '→'}
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
} 