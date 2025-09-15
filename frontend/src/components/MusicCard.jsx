import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';

export default function MusicCard({ 
  item, 
  type, 
  onHeartClick, 
  isInFavorites, 
  showRating = false, 
  onRatingClick, 
  currentRating = 0,
  onAddToFavorites,
  onRemoveFromFavorites,
  onRate,
  onSetRating,
  rating = 0
}) {
  const navigate = useNavigate();
  const { handleHeartClick: hookHandleHeartClick, isInFavorites: hookIsInFavorites } = useFavorites();
  
  const handleCardClick = () => {
    // Naviguer vers la page de détail de la musique
    const title = encodeURIComponent(item.title || 'Titre inconnu');
    const artist = encodeURIComponent(item.artist || item.albumTitle || 'Artiste inconnu');
    const coverUrl = encodeURIComponent(item.coverUrl || item.cover || '');
    
    navigate(`/music/${item.id}/${title}/${artist}/${coverUrl}`);
  };

  // Gérer le clic sur le cœur
  const handleHeartClick = async (e) => {
    e.stopPropagation(); // Empêcher la navigation
    
    if (onHeartClick) {
      // Utiliser la fonction fournie par le parent
      onHeartClick();
    } else if (onAddToFavorites && onRemoveFromFavorites) {
      // Utiliser les fonctions spécifiques fournies par le parent
      if (isInFavorites) {
        onRemoveFromFavorites();
      } else {
        onAddToFavorites();
      }
    } else {
      // Utiliser la fonction du hook pour gérer les favoris
      try {
        const result = await hookHandleHeartClick(
          item.id, 
          item.title, 
          item.artist || item.albumTitle, 
          item.coverUrl || item.cover
        );
        console.log(result.message);
      } catch (error) {
        console.error('Error handling heart click:', error);
      }
    }
  };

  // Déterminer si l'item est dans les favoris
  const isFavorite = isInFavorites !== undefined ? isInFavorites : hookIsInFavorites(item.id, item.title, item.artist || item.albumTitle);
  
  return (
    <div 
      style={{ 
        position: 'relative', 
        minWidth: 150, 
        width: 150, 
        height: 260, 
        borderRadius: 16, 
        overflow: 'hidden', 
        boxShadow: '0 2px 12px 0 rgba(0,0,0,0.10)', 
        background: '#222', 
        cursor: 'pointer', 
        transition: 'box-shadow 0.18s, border 0.18s', 
        border: '2px solid transparent' 
      }}
      onClick={handleCardClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 20px 0 rgba(0,0,0,0.15)';
        e.currentTarget.style.border = '2px solid #ff9100';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 12px 0 rgba(0,0,0,0.10)';
        e.currentTarget.style.border = '2px solid transparent';
      }}
    >
      {/* Image de couverture */}
      {item.coverUrl || item.cover ? (
        <img 
          src={item.coverUrl || item.cover} 
          alt={item.title || 'Titre inconnu'} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
        />
      ) : (
        <div style={{ 
          width: '100%', 
          height: '100%', 
          background: '#444', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: '#999', 
          fontSize: '0.8rem' 
        }}>
          Pas d'image
        </div>
      )}
      
      {/* Informations de la musique */}
      <div style={{ 
        position: 'absolute', 
        left: 0, 
        right: 0, 
        bottom: 0, 
        padding: '0 0 8px 0', 
        background: 'linear-gradient(0deg, rgba(24,21,28,0.92) 70%, rgba(24,21,28,0.0) 100%)', 
        color: '#fff', 
        textAlign: 'center' 
      }}>
        <div style={{ 
          fontWeight: 700, 
          fontSize: '1.05rem', 
          marginBottom: 2, 
          textShadow: '0 2px 8px rgba(0,0,0,0.18)' 
        }}>
          {item.title || 'Titre inconnu'}
        </div>
        {(item.albumTitle || item.artist) && (
          <div style={{ 
            color: '#ff9100', 
            fontWeight: 600, 
            fontSize: '0.98rem', 
            textShadow: '0 2px 8px rgba(0,0,0,0.18)' 
          }}>
            {item.albumTitle || item.artist}
          </div>
        )}
      </div>
      
      {/* Bouton cœur (favoris) */}
      <button
        onClick={handleHeartClick}
        style={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          fontSize: '20px',
          color: isFavorite ? '#ff3e3e' : '#fff',
          textShadow: '0 2px 4px rgba(0,0,0,0.8)',
          zIndex: 5,
          transition: 'color 0.2s'
        }}
      >
        {isFavorite ? '♥' : '♡'}
      </button>
      
      {/* Indicateur de type */}
      <div style={{
        position: 'absolute',
        top: 8,
        left: 8,
        background: '#ff9100',
        color: '#18151c',
        padding: '4px 8px',
        borderRadius: 12,
        fontSize: '0.7rem',
        fontWeight: 600,
        textTransform: 'uppercase'
      }}>
        {type === 'album' ? 'Album' : 'Titre'}
      </div>
    </div>
  );
}
