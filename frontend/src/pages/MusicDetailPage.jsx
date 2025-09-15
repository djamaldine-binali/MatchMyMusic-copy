import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import Header from '../components/Header';

export default function MusicDetailPage() {
  const { musicId, title, artist, coverUrl } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [comment, setComment] = useState('');
  const [allComments, setAllComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deezerData, setDeezerData] = useState(null);
  const [deezerLoading, setDeezerLoading] = useState(true);
  const [internalMusicId, setInternalMusicId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [musicInfo, setMusicInfo] = useState({ title: title || '', artist: artist || '', coverUrl: coverUrl || '' });

  // Fonction de retour intelligent
  const handleSmartBack = () => {
    // Vérifier s'il y a un état admin sauvegardé
    const savedState = localStorage.getItem('adminState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        
        // Si on était sur un onglet admin spécifique, y retourner
        if (state.activeTab && state.activeTab !== 'stats') {
          // Marquer qu'on navigue en interne dans l'admin
          sessionStorage.setItem('adminInternalNavigation', 'true');
          navigate('/admin');
          return;
        }
      } catch (error) {
        console.error('Error parsing saved admin state:', error);
      }
    }
    
    // Sinon, retourner à la page principale
    navigate('/main');
  };

  // Charger les informations de la musique depuis Deezer si elles ne sont pas dans l'URL
  useEffect(() => {
    const loadMusicInfo = async () => {
      
      // Si on a déjà les informations dans l'URL, les utiliser
      if (title && artist && coverUrl) {
        setMusicInfo({ title, artist, coverUrl });
        setDeezerLoading(false);
        return;
      }

      // Sinon, récupérer depuis l'API Deezer via notre backend
      try {
        setDeezerLoading(true);
        console.log('🔍 Appel API backend pour trackId:', musicId);
        const response = await fetch(`/api/music/deezer/${musicId}`);
        console.log('📡 Réponse reçue, status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📊 Données reçues du backend:', data);
          console.log('🔍 Contenu de data.musicInfo:', data.musicInfo);
          console.log('🔍 Type de data.musicInfo:', typeof data.musicInfo);
          
          if (data.success && data.musicInfo) {
            const newMusicInfo = {
              title: data.musicInfo.title || 'Titre inconnu',
              artist: data.musicInfo.artist || 'Artiste inconnu',
              coverUrl: data.musicInfo.coverUrl || ''
            };
            
            console.log('💾 Nouveau musicInfo à définir:', newMusicInfo);
            setMusicInfo(newMusicInfo);
          } else {
            console.error('❌ Réponse backend invalide:', data);
            setMusicInfo({
              title: 'Titre inconnu',
              artist: 'Artiste inconnu',
              coverUrl: ''
            });
          }
        } else {
          console.error('❌ Erreur API backend:', response.status, response.statusText);
          setMusicInfo({
            title: 'Titre inconnu',
            artist: 'Artiste inconnu',
            coverUrl: ''
          });
        }
      } catch (error) {
        console.error('❌ Erreur lors du chargement des informations de la musique:', error);
        setMusicInfo({
          title: 'Titre inconnu',
          artist: 'Artiste inconnu',
          coverUrl: ''
        });
      } finally {
        setDeezerLoading(false);
      }
    };

    loadMusicInfo();
  }, [musicId, title, artist, coverUrl]);
  
  // Charger l'ID interne de la musique
  useEffect(() => {
    const loadInternalMusicId = async () => {
      try {
        const musicRes = await fetch(`/api/music/by-mbid/${musicId}`);
        if (musicRes.ok) {
          const musicData = await musicRes.json();
          if (musicData.success && musicData.music) {
            setInternalMusicId(musicData.music.id);
          }
        }
      } catch (err) {
        console.error('Error loading internal music ID:', err);
      }
    };
    
    loadInternalMusicId();
  }, [musicId]);
  
  // Charger le commentaire de l'utilisateur et tous les commentaires
  useEffect(() => {
    if (!internalMusicId) return;
    
    const loadAllData = async () => {
      const token = localStorage.getItem('token');
      
      try {
        // Charger tous les commentaires (incluant celui de l'utilisateur)
        const commentsRes = await fetch(`/api/comments/music/${internalMusicId}`, {
          headers: token ? { 'Authorization': 'Bearer ' + token } : {}
        });
        const commentsData = await commentsRes.json();
        
        if (commentsData.success) {
          setAllComments(commentsData.comments || []);
          
          // Vérifier le statut admin
          try {
            const profileRes = await fetch('/api/users/profile', {
              headers: { 'Authorization': 'Bearer ' + token }
            });
            if (profileRes.ok) {
              const profileData = await profileRes.json();
              setIsAdmin(profileData.user.isAdmin || false);
            }
          } catch (err) {
            console.error('Error checking admin status:', err);
          }
        }
      } catch (err) {
        console.error('❌ Erreur chargement commentaires:', err);
      }
    };
    
    loadAllData();
  }, [internalMusicId]);
  
  // Charger les données Deezer
  useEffect(() => {
    const fetchDeezerData = async () => {
      setDeezerLoading(true);
      
      try {
        // Essayer d'abord comme une chanson via notre proxy
        let response = await fetch(`/api/deezer/track/${musicId}`);
        let data = await response.json();
        
        if (data.error) {
          // Si pas de chanson, essayer comme un album
          response = await fetch(`/api/deezer/album/${musicId}`);
          data = await response.json();
          
          if (data.error) {
            setDeezerData(null);
            return;
          }
          
          // C'est un album
          const albumData = {
            type: 'album',
            title: data.title,
            artist: data.artist?.name,
            cover: data.cover_big,
            genre: data.genres?.data?.[0]?.name,
            releaseDate: data.release_date,
            tracks: data.tracks?.data?.length || 0,
            duration: data.duration,
            fans: data.fans,
            rating: data.rating
          };
          setDeezerData(albumData);
        } else {
          // C'est une chanson
          const trackData = {
            type: 'track',
            title: data.title,
            artist: data.artist?.name,
            album: data.album?.title,
            cover: data.album?.cover_big,
            genre: data.genre_id,
            releaseDate: data.release_date,
            duration: data.duration,
            bpm: data.bpm,
            gain: data.gain,
            rank: data.rank
          };
          setDeezerData(trackData);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération Deezer:', error);
        setDeezerData(null);
      } finally {
        setDeezerLoading(false);
      }
    };
    
    fetchDeezerData();
  }, [musicId]);
  
  const handleSubmitComment = async () => {
    if (!comment.trim()) {
      toast('Le commentaire ne peut pas être vide');
      return;
    }
    
    if (!internalMusicId) {
      toast('Erreur: ID de musique non trouvé');
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({ 
          musicId: internalMusicId, 
          content: comment.trim()
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast(data.message);
        setComment(''); // Vider le champ après publication
        
        // Mettre à jour immédiatement la liste des commentaires
        setAllComments(prevComments => {
          // Ajouter le nouveau commentaire en premier
          return [data.comment, ...prevComments];
        });
        
      } else {
        toast(data.error || 'Erreur lors de la sauvegarde');
        console.error('❌ Erreur sauvegarde:', data.error);
      }
    } catch (error) {
      console.error('💥 Erreur exception sauvegarde:', error);
      toast('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editingContent.trim()) {
      toast('Le commentaire ne peut pas être vide');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({ content: editingContent.trim() }),
      });
      
      if (res.ok) {
        const data = await res.json();
        toast.success(data.message);
        
        // Mettre à jour le commentaire dans la liste
        setAllComments(prevComments => 
          prevComments.map(c => 
            c.id === commentId 
              ? { ...c, content: editingContent.trim(), updatedAt: new Date().toISOString() }
              : c
          )
        );
        
        // Sortir du mode édition
        setEditingCommentId(null);
        setEditingContent('');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Erreur lors de la modification');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Erreur lors de la modification');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      
      if (res.ok) {
        toast.success('Commentaire supprimé avec succès');
        // Retirer le commentaire de la liste
        setAllComments(prevComments => 
          prevComments.filter(c => c.id !== commentId)
        );
      } else {
        const data = await res.json();
        toast.error(data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const startEditing = (comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditingContent('');
  };
  
  const decodedTitle = decodeURIComponent(musicInfo.title || '');
  const decodedArtist = decodeURIComponent(musicInfo.artist || '');
  const decodedCoverUrl = decodeURIComponent(musicInfo.coverUrl || '');
  
  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <div style={{ minHeight: '100vh', background: '#18151c' }}>
      <Header />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px', color: '#fff' }}>
        {/* Bouton retour */}
        <button 
          onClick={handleSmartBack}
          style={{
            background: 'transparent',
            color: '#ff9100',
            border: '1px solid #ff9100',
            borderRadius: 8,
            padding: '8px 16px',
            cursor: 'pointer',
            fontWeight: 600,
            marginBottom: 24
          }}
        >
          ← Retour
        </button>
        
        {/* En-tête de la musique avec infos Deezer */}
        <div style={{ display: 'flex', gap: 32, marginBottom: 40 }}>
          {/* Cover */}
          <div style={{ flexShrink: 0 }}>
            {decodedCoverUrl ? (
              <img 
                src={decodedCoverUrl} 
                alt={decodedTitle} 
                style={{ 
                  width: 300, 
                  height: 300, 
                  borderRadius: 20, 
                  objectFit: 'cover',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                }} 
              />
            ) : (
              <div style={{ 
                width: 300, 
                height: 300, 
                background: '#444', 
                borderRadius: 20, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#999',
                fontSize: '1.2rem'
              }}>
                Pas d'image
              </div>
            )}
          </div>
          
          {/* Informations et résumé */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Titre et artiste */}
            <div>
              <h1 style={{ margin: '0 0 8px 0', fontSize: '2.5rem', color: '#fff', lineHeight: 1.2 }}>
                {deezerData?.title || decodedTitle}
              </h1>
              <h2 style={{ margin: '0 0 16px 0', fontSize: '1.5rem', color: '#ff9100' }}>
                {deezerData?.artist || decodedArtist}
              </h2>
              {deezerData?.album && deezerData.type === 'track' && (
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: '#ccc' }}>
                  Album : {deezerData.album}
                </h3>
              )}
            </div>
            
            {/* Détails Deezer */}
            {!deezerLoading && deezerData && (
              <div style={{ 
                background: 'rgba(255, 145, 0, 0.1)', 
                padding: 20, 
                borderRadius: 16, 
                border: '1px solid rgba(255, 145, 0, 0.3)'
              }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#ff9100', fontSize: '1.1rem' }}>
                  Informations
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                  {deezerData.type === 'track' ? (
                    <>
                      {deezerData.duration && (
                        <div>
                          <strong>Durée :</strong> {formatDuration(deezerData.duration)}
                        </div>
                      )}
                      {deezerData.bpm && (
                        <div>
                          <strong>BPM :</strong> {deezerData.bpm}
                        </div>
                      )}
                      {deezerData.rank && (
                        <div>
                          <strong>Classement :</strong> #{deezerData.rank}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {deezerData.tracks && (
                        <div>
                          <strong>Nombre de pistes :</strong> {deezerData.tracks}
                        </div>
                      )}
                      {deezerData.fans && (
                        <div>
                          <strong>Fans :</strong> {deezerData.fans.toLocaleString()}
                        </div>
                      )}
                      {deezerData.rating && (
                        <div>
                          <strong>Note :</strong> {deezerData.rating}/5
                        </div>
                      )}
                    </>
                  )}
                  {deezerData.genre && (
                    <div>
                      <strong>Genre :</strong> {deezerData.genre}
                    </div>
                  )}
                  {deezerData.releaseDate && (
                    <div>
                      <strong>Date de sortie :</strong> {formatDate(deezerData.releaseDate)}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {deezerLoading && (
              <div style={{ 
                background: 'rgba(255, 145, 0, 0.1)', 
                padding: 20, 
                borderRadius: 16, 
                border: '1px solid rgba(255, 145, 0, 0.3)',
                textAlign: 'center',
                color: '#ff9100'
              }}>
                Chargement des informations...
              </div>
            )}
          </div>
        </div>
        
        {/* Section commentaires */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Commentaire utilisateur */}
          <div>
            <h3 style={{ margin: '0 0 16px 0', color: '#ff9100' }}>
              Ajouter un commentaire
            </h3>
            
            <div style={{ marginBottom: 24 }}>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Partagez vos pensées sur cette musique..."
                style={{
                  width: '100%',
                  minHeight: 80,
                  padding: 16,
                  borderRadius: 12,
                  border: '1px solid #333',
                  background: '#222',
                  color: '#fff',
                  fontSize: '1rem',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
              <div style={{ marginTop: 16 }}>
                <button
                  onClick={handleSubmitComment}
                  disabled={loading}
                  style={{
                    background: '#ff9100',
                    color: '#18151c',
                    border: 'none',
                    borderRadius: 8,
                    padding: '12px 24px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    marginRight: 12,
                    fontSize: '1rem'
                  }}
                >
                  {loading ? 'Sauvegarde...' : 'Publier'}
                </button>
              </div>
            </div>
          </div>
          
          {/* Tous les commentaires */}
          <div>
            <h3 style={{ margin: '0 0 16px 0', color: '#ff9100' }}>
              Commentaires ({allComments.length})
            </h3>
            
            {allComments.length === 0 ? (
              <div style={{ 
                background: '#222', 
                padding: 40, 
                borderRadius: 16, 
                textAlign: 'center',
                color: '#999',
                fontStyle: 'italic'
              }}>
                Aucun commentaire pour le moment.<br />
                Soyez le premier à partager vos pensées !
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {allComments.map(comment => (
                  <div key={comment.id} style={{ 
                    background: '#222', 
                    padding: 20, 
                    borderRadius: 16,
                    border: 'none'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      marginBottom: 12 
                    }}>
                      <span style={{ 
                        fontWeight: 600, 
                        color: '#ff9100',
                        fontSize: '1.1rem'
                      }}>
                        {comment.user.username}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {/* Boutons pour l'utilisateur connecté */}
                        {comment.isMine && (
                          <>
                            <button
                              onClick={() => startEditing(comment)}
                              style={{
                                background: '#4a90e2',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: '600'
                              }}
                              title="Modifier mon commentaire"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              style={{
                                background: '#ff3e3e',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: '600'
                              }}
                              title="Supprimer mon commentaire"
                            >
                              Supprimer
                            </button>
                          </>
                        )}
                        {/* Boutons pour les admins */}
                        {isAdmin && !comment.isMine && (
                          <>
                            <button
                              onClick={() => startEditing(comment)}
                              style={{
                                background: '#4a90e2',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: '600'
                              }}
                              title="Modifier ce commentaire (Admin)"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              style={{
                                background: '#ff3e3e',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: '600'
                              }}
                              title="Supprimer ce commentaire (Admin)"
                            >
                              Supprimer
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <p style={{ margin: 0, lineHeight: '1.6', fontSize: '1rem' }}>
                      {editingCommentId === comment.id ? (
                        <textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          style={{
                            width: '100%',
                            minHeight: 80,
                            padding: 16,
                            borderRadius: 12,
                            border: '1px solid #333',
                            background: '#222',
                            color: '#fff',
                            fontSize: '1rem',
                            resize: 'vertical',
                            fontFamily: 'inherit'
                          }}
                        />
                      ) : (
                        comment.content
                      )}
                    </p>
                    
                    {/* Date de création/modification */}
                    <div style={{ 
                      marginTop: 12, 
                      fontSize: '0.9rem', 
                      color: '#999',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      <span>Créé le {new Date(comment.createdAt).toLocaleDateString('fr-FR')}</span>
                      {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                        <span>Modifié le {new Date(comment.updatedAt).toLocaleDateString('fr-FR')}</span>
                      )}
                    </div>
                    
                    {editingCommentId === comment.id && (
                      <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
                        <button
                          onClick={() => handleEditComment(comment.id)}
                          disabled={loading}
                          style={{
                            background: '#4a90e2',
                            color: '#18151c',
                            border: 'none',
                            borderRadius: 8,
                            padding: '12px 24px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            fontSize: '1rem'
                          }}
                        >
                          {loading ? 'Sauvegarde...' : 'Enregistrer'}
                        </button>
                        <button
                          onClick={cancelEditing}
                          style={{
                            background: '#ccc',
                            color: '#18151c',
                            border: 'none',
                            borderRadius: 8,
                            padding: '12px 24px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '1rem'
                          }}
                        >
                          Annuler
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 