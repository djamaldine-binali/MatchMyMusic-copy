import { useState, useEffect } from 'react';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger les favoris
  const loadFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      const res = await fetch('/api/music/favorites?page=1&pageSize=100', {
        headers: { 'Authorization': 'Bearer ' + token }
      });

      if (res.ok) {
        const data = await res.json();
        setFavorites(data.items || []);
      } else {
        console.error('Error loading favorites:', res.status);
        setFavorites([]);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  // Vérifier si une musique est dans les favoris
  const isInFavorites = (musicId, title, artist) => {
    return favorites.some(fav => {
      // Priorité 1: ID Deezer (mbid)
      if (fav.music?.mbid === musicId || fav.mbid === musicId) {
        return true;
      }
      
      // Priorité 2: titre et artiste
      const titleMatch = fav.title === title;
      const artistMatch = fav.albumTitle === artist;
      return titleMatch && artistMatch;
    });
  };

  // Ajouter aux favoris
  const addToFavorites = async (musicId, title, artist, coverUrl) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        if (window.toast) {
          window.toast.error('Veuillez vous connecter pour ajouter aux favoris');
        }
        return { success: false, message: 'Veuillez vous connecter' };
      }

      const res = await fetch('/api/music/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({
          musicId: musicId,
          title: title,
          artist: artist,
          coverUrl: coverUrl
        }),
      });

      if (res.ok) {
        if (window.toast) {
          window.toast.success(`${title} ajouté aux favoris !`);
        }
        // Recharger les favoris pour mettre à jour l'état
        await loadFavorites();
        return { success: true, message: 'Ajouté aux favoris !' };
      } else {
        const errorData = await res.json();
        const errorMessage = errorData.error || 'Erreur lors de l\'ajout';
        if (window.toast) {
          window.toast.error(errorMessage);
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
      if (!error.message.includes('Veuillez vous connecter')) {
        if (window.toast) {
          window.toast.error('Erreur lors de l\'ajout aux favoris');
        }
      }
      throw error;
    }
  };

  // Retirer des favoris
  const removeFromFavorites = async (musicId, title, artist) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        if (window.toast) {
          window.toast.error('Veuillez vous connecter pour retirer des favoris');
        }
        return { success: false, message: 'Veuillez vous connecter' };
      }

      // Trouver l'ID du favori dans la base de données
      const favoriteItem = favorites.find(fav => {
        // Priorité 1: ID Deezer (mbid)
        if (fav.music?.mbid === musicId || fav.mbid === musicId) {
          return true;
        }
        
        // Priorité 2: titre et artiste
        const titleMatch = fav.title === title;
        const artistMatch = fav.albumTitle === artist;
        return titleMatch && artistMatch;
      });

      if (!favoriteItem) {
        if (window.toast) {
          window.toast.error('Favori non trouvé');
        }
        throw new Error('Favori non trouvé');
      }

      const res = await fetch(`/api/music/favorites/${favoriteItem.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      });

      if (res.ok) {
        if (window.toast) {
          window.toast.success(`${title} retiré des favoris !`);
        }
        // Recharger les favoris pour mettre à jour l'état
        await loadFavorites();
        return { success: true, message: 'Retiré des favoris !' };
      } else {
        const errorData = await res.json();
        const errorMessage = errorData.error || 'Erreur lors de la suppression';
        if (window.toast) {
          window.toast.error(errorMessage);
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
      if (!error.message.includes('Veuillez vous connecter') && !error.message.includes('Favori non trouvé')) {
        if (window.toast) {
          window.toast.error('Erreur lors de la suppression des favoris');
        }
      }
      throw error;
    }
  };

  // Gérer le clic sur le cœur (ajouter/retirer des favoris)
  const handleHeartClick = async (musicId, title, artist, coverUrl) => {
    try {
      if (isInFavorites(musicId, title, artist)) {
        // Si c'est déjà un favori, le retirer
        const result = await removeFromFavorites(musicId, title, artist);
        return result;
      } else {
        // Sinon l'ajouter
        const result = await addToFavorites(musicId, title, artist, coverUrl);
        return result;
      }
    } catch (error) {
      throw error;
    }
  };

  // Charger les favoris au montage du composant
  useEffect(() => {
    loadFavorites();
  }, []);

  return {
    favorites,
    loading,
    isInFavorites,
    addToFavorites,
    removeFromFavorites,
    handleHeartClick,
    loadFavorites
  };
}; 