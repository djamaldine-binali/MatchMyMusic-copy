import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Header from '../components/Header';

export default function ChatPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversationInfo, setConversationInfo] = useState(null);
  const messagesEndRef = useRef(null);

  // Charger les messages de la conversation
  useEffect(() => {
    if (conversationId) {
      loadMessages();
    }
  }, [conversationId]);

  // Scroll automatique vers le bas
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const res = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
        headers: { 'Authorization': 'Bearer ' + token }
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        
        // Charger les informations de la conversation
        await loadConversationInfo();
      } else {
        toast.error('Erreur lors du chargement des messages');
        navigate('/matches');
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Erreur lors du chargement des messages');
      navigate('/matches');
    } finally {
      setLoading(false);
    }
  };

  const loadConversationInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/chat/conversations', {
        headers: { 'Authorization': 'Bearer ' + token }
      });

      if (res.ok) {
        const data = await res.json();
        const conversation = data.conversations.find(c => c.id === parseInt(conversationId));
        if (conversation) {
          setConversationInfo(conversation);
        }
      }
    } catch (error) {
      console.error('Error loading conversation info:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const token = localStorage.getItem('token');
      
      const res = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
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

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return date.toLocaleDateString('fr-FR', { weekday: 'long' });
    return date.toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#18151c' }}>
        <Header />
        <main style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px', color: '#fff' }}>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p>Chargement de la conversation...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#18151c' }}>
      <Header />
      
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px', color: '#fff' }}>
        {/* Header de la conversation */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 16, 
          marginBottom: 24,
          padding: '16px',
          background: '#222',
          borderRadius: '12px',
          border: '1px solid #333'
        }}>
          <button 
            onClick={() => navigate('/matches')}
            style={{
              background: 'transparent',
              color: '#ff9100',
              border: '1px solid #ff9100',
              borderRadius: '8px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            ← Retour aux matches
          </button>
          
          {conversationInfo && (
            <div style={{ flex: 1 }}>
              <h1 style={{ margin: 0, color: '#ff9100', fontSize: '1.5rem' }}>
                Chat avec {conversationInfo.otherUser.username}
              </h1>
              <div style={{ color: '#999', fontSize: '0.9rem' }}>
                {conversationInfo.messageCount} message{conversationInfo.messageCount > 1 ? 's' : ''}
              </div>
            </div>
          )}
        </div>

        {/* Zone des messages */}
        <div style={{
          height: '60vh',
          background: '#222',
          borderRadius: '12px',
          border: '1px solid #333',
          padding: '20px',
          marginBottom: '20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {messages.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              color: '#999', 
              padding: '40px 0',
              fontStyle: 'italic'
            }}>
              Aucun message pour le moment. Commencez la conversation !
            </div>
          ) : (
            messages.map((message, index) => {
              const isOwnMessage = message.sender.id === parseInt(localStorage.getItem('userId') || '0');
              const showDate = index === 0 || 
                new Date(message.createdAt).toDateString() !== 
                new Date(messages[index - 1].createdAt).toDateString();

              return (
                <div key={message.id}>
                  {/* Séparateur de date */}
                  {showDate && (
                    <div style={{
                      textAlign: 'center',
                      margin: '16px 0',
                      color: '#666',
                      fontSize: '0.8rem'
                    }}>
                      {formatDate(message.createdAt)}
                    </div>
                  )}
                  
                  {/* Message */}
                  <div style={{
                    display: 'flex',
                    justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      maxWidth: '70%',
                      padding: '12px 16px',
                      borderRadius: '16px',
                      background: isOwnMessage ? '#ff9100' : '#333',
                      color: isOwnMessage ? '#000' : '#fff',
                      position: 'relative'
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
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Formulaire d'envoi de message */}
        <form onSubmit={sendMessage} style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-end'
        }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Tapez votre message..."
            disabled={sending}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #333',
              background: '#222',
              color: '#fff',
              fontSize: '1rem'
            }}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              background: newMessage.trim() && !sending ? '#ff9100' : '#666',
              color: newMessage.trim() && !sending ? '#000' : '#999',
              cursor: newMessage.trim() && !sending ? 'pointer' : 'not-allowed',
              fontWeight: '600',
              fontSize: '1rem'
            }}
          >
            {sending ? 'Envoi...' : 'Envoyer'}
          </button>
        </form>
      </main>
    </div>
  );
} 