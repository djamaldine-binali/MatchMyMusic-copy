import React, { useState } from 'react';
import { toast } from 'react-toastify';

export default function UserActions({ userId, username, onBlock, onUnblock, isBlocked, isTargetAdmin = false }) {
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleBlock = async () => {
    try {
      await onBlock(userId, username);
      toast.success(`Utilisateur ${username} bloqué avec succès`);
    } catch (error) {
      toast.error(error.message || 'Erreur lors du blocage');
    }
  };

  const handleUnblock = async () => {
    try {
      await onUnblock(userId, username);
      toast.success(`Utilisateur ${username} débloqué avec succès`);
    } catch (error) {
      toast.error(error.message || 'Erreur lors du déblocage');
    }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    
    if (!reportReason.trim()) {
      toast.error('Veuillez sélectionner une raison');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reportedId: userId,
          reason: reportReason,
          description: reportDescription.trim() || null
        })
      });

      if (response.ok) {
        toast.success('Utilisateur signalé avec succès');
        setShowReportModal(false);
        setReportReason('');
        setReportDescription('');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors du signalement');
      }
    } catch (error) {
      toast.error(error.message || 'Erreur lors du signalement');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Boutons d'action */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginTop: '12px'
      }}>
        {isBlocked ? (
          <button
            onClick={handleUnblock}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #ff9100',
              background: 'transparent',
              color: '#ff9100',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: '500'
            }}
            title="Débloquer cet utilisateur"
          >
            Débloquer
          </button>
        ) : (
          <button
            onClick={handleBlock}
            disabled={isTargetAdmin}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #ff4444',
              background: 'transparent',
              color: isTargetAdmin ? '#666' : '#ff4444',
              cursor: isTargetAdmin ? 'not-allowed' : 'pointer',
              fontSize: '0.8rem',
              fontWeight: '500',
              opacity: isTargetAdmin ? 0.5 : 1
            }}
            title={isTargetAdmin ? 'Impossible de bloquer un administrateur' : 'Bloquer cet utilisateur'}
          >
            {isTargetAdmin ? 'Admin (non bloquable)' : 'Bloquer'}
          </button>
        )}
        
        <button
          onClick={() => setShowReportModal(true)}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid #ffaa00',
            background: 'transparent',
            color: '#ffaa00',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: '500'
          }}
          title="Signaler cet utilisateur"
        >
          Signaler
        </button>
      </div>

      {/* Message d'information pour les admins */}
      {isTargetAdmin && !isBlocked && (
        <div style={{
          marginTop: '8px',
          padding: '6px 8px',
          background: 'rgba(255,145,0,0.1)',
          border: '1px solid rgba(255,145,0,0.3)',
          borderRadius: '4px',
          fontSize: '0.75rem',
          color: '#ffaa00',
          textAlign: 'center'
        }}>
          ⚠️ Les administrateurs ne peuvent pas être bloqués
        </div>
      )}

      {/* Modal de signalement */}
      {showReportModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div style={{
            background: '#1a1a1a',
            borderRadius: '12px',
            padding: '24px',
            width: '90%',
            maxWidth: '500px',
            border: '1px solid #333'
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              color: '#ffaa00',
              fontSize: '1.2rem'
            }}>
              Signaler {username}
            </h3>
            
            <form onSubmit={handleReport}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#fff',
                  fontWeight: '500'
                }}>
                  Raison du signalement *
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #333',
                    background: '#222',
                    color: '#fff',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value="">Sélectionnez une raison</option>
                  <option value="Comportement abusif">Comportement abusif</option>
                  <option value="Spam">Spam</option>
                  <option value="Contenu inapproprié">Contenu inapproprié</option>
                  <option value="Harcèlement">Harcèlement</option>
                  <option value="Fausse identité">Fausse identité</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#fff',
                  fontWeight: '500'
                }}>
                  Description (optionnel)
                </label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Décrivez le problème en détail..."
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #333',
                    background: '#222',
                    color: '#fff',
                    fontSize: '0.9rem',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end'
              }}>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '6px',
                    border: '1px solid #666',
                    background: 'transparent',
                    color: '#999',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!reportReason.trim() || submitting}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '6px',
                    border: 'none',
                    background: reportReason.trim() && !submitting ? '#ffaa00' : '#666',
                    color: reportReason.trim() && !submitting ? '#000' : '#999',
                    cursor: reportReason.trim() && !submitting ? 'pointer' : 'not-allowed',
                    fontWeight: '600',
                    fontSize: '0.9rem'
                  }}
                >
                  {submitting ? 'Envoi...' : 'Signaler'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
} 