import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import { useNavigate, useLocation } from 'react-router-dom';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('stats');
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [music, setMusic] = useState([]);
  const [reports, setReports] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedReports, setExpandedReports] = useState(new Set()); // Nouvel état pour le déroulement
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [allMusic, setAllMusic] = useState([]); // All music for filtering
  const [filteredMusic, setFilteredMusic] = useState([]); // Filtered music
  const [pageSize] = useState(15); // Changed from 20 to 15
  const navigate = useNavigate(); // Initialize useNavigate
  const location = useLocation(); // Initialize useLocation

  // Restaurer l'état au chargement de la page - seulement si on vient de l'intérieur de l'admin
  useEffect(() => {
    // Vérifier si on vient de l'intérieur de l'admin (pas depuis la home page)
    const isFromAdminInternal = sessionStorage.getItem('adminInternalNavigation');
    
    if (isFromAdminInternal) {
      const savedState = localStorage.getItem('adminState');
      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          console.log('📖 État admin restauré (navigation interne):', state);
          
          // Vérifier que l'état n'est pas trop ancien (moins de 1 heure)
          const isStateFresh = Date.now() - state.timestamp < 3600000; // 1 heure
          
          if (isStateFresh && state.activeTab && state.activeTab !== 'stats') {
            console.log('🔄 Restauration de l\'état admin:', state.activeTab);
            // Restaurer l'état de manière différée pour éviter les conflits
            setTimeout(() => {
              setActiveTab(state.activeTab);
              setCurrentPage(state.currentPage || 1);
              setSearchTerm(state.searchTerm || '');
            }, 100);
          } else {
            console.log('⏰ État admin trop ancien ou stats, pas de restauration');
          }
        } catch (error) {
          console.error('❌ Erreur parsing état admin sauvegardé:', error);
        }
      }
      
      // Nettoyer le flag de navigation interne
      sessionStorage.removeItem('adminInternalNavigation');
    } else {
      console.log('🏠 Arrivée depuis l\'extérieur de l\'admin, pas de restauration d\'état');
      // Réinitialiser à l'état par défaut
      setActiveTab('stats');
      setCurrentPage(1);
      setSearchTerm('');
    }
  }, []);

  // Gérer l'historique de navigation - seulement après le premier chargement
  const [hasInitialized, setHasInitialized] = useState(false);
  
  useEffect(() => {
    if (hasInitialized) {
      // Sauvegarder l'état actuel dans le localStorage
      const saveState = () => {
        const stateToSave = {
          activeTab,
          currentPage,
          searchTerm,
          timestamp: Date.now()
        };
        localStorage.setItem('adminState', JSON.stringify(stateToSave));
        console.log('💾 État admin sauvegardé:', stateToSave);
      };

      // Sauvegarder l'état quand l'utilisateur change d'onglet ou de page
      saveState();
    }
  }, [activeTab, currentPage, searchTerm, hasInitialized]);

  // Marquer comme initialisé après la restauration
  useEffect(() => {
    setHasInitialized(true);
  }, []);

  // Fonction pour gérer le retour intelligent
  const handleSmartBack = () => {
    console.log('🔙 Bouton retour intelligent cliqué');
    
    // Vérifier s'il y a un état sauvegardé
    const savedState = localStorage.getItem('adminState');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        console.log('📖 État admin trouvé pour retour:', state);
        
        // Si on était sur un onglet spécifique, y retourner
        if (state.activeTab && state.activeTab !== 'stats') {
          console.log('🔄 Retour à l\'onglet admin:', state.activeTab);
          // Marquer qu'on navigue en interne dans l'admin
          sessionStorage.setItem('adminInternalNavigation', 'true');
          setActiveTab(state.activeTab);
          setCurrentPage(state.currentPage || 1);
          setSearchTerm(state.searchTerm || '');
          return;
        }
      } catch (error) {
        console.error('❌ Erreur parsing état admin pour retour:', error);
      }
    }
    
    console.log('🏠 Retour à la page principale');
    // Sinon, retourner à la page principale
    navigate('/main');
  };

  // Calculer les musiques à afficher pour la page courante
  const displayedMusic = filteredMusic.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPagesCount = Math.ceil(filteredMusic.length / pageSize);

  // Charger les statistiques
  useEffect(() => {
    if (activeTab === 'stats') {
      loadStats();
    }
  }, [activeTab]);

  // Charger les utilisateurs
  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab, currentPage]);

  // Charger les commentaires
  useEffect(() => {
    if (activeTab === 'comments') {
      loadComments();
    }
  }, [activeTab, currentPage]);

  // Charger les musiques
  useEffect(() => {
    if (activeTab === 'music') {
      loadMusic();
    }
  }, [activeTab]); // Suppression de currentPage et searchTerm car géré par d'autres useEffect

  // Charger les données selon l'onglet actif
  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers(currentPage);
    } else if (activeTab === 'comments') {
      loadComments(currentPage);
    } else if (activeTab === 'music') {
      loadMusic(currentPage);
    } else if (activeTab === 'reports') {
      loadReports(currentPage);
    }
  }, [activeTab, currentPage]);

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/stats', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error('Erreur lors du chargement des statistiques');
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/users?page=${currentPage}&pageSize=${pageSize}`, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (page = 1) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/comments?page=${page}&pageSize=20`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
        setTotalPages(Math.ceil(data.total / 20));
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error('Erreur lors du chargement des commentaires');
    }
  };

  // Fonction helper pour obtenir la couleur du statut
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffaa00';
      case 'reviewed': return '#4a90e2';
      case 'resolved': return '#4caf50';
      case 'dismissed': return '#999';
      default: return '#666';
    }
  };

  // Fonction helper pour obtenir le texte du statut
  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'reviewed': return 'Examiné';
      case 'resolved': return 'Résolu';
      case 'dismissed': return 'Rejeté';
      default: return 'Inconnu';
    }
  };

  // Fonction helper pour formater les dates
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

  // Fonction pour gérer le déroulement des signalements
  const toggleReportExpansion = (reportedUserId) => {
    setExpandedReports(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reportedUserId)) {
        newSet.delete(reportedUserId);
      } else {
        newSet.add(reportedUserId);
      }
      return newSet;
    });
  };

  // Charger les signalements groupés
  const loadReports = async (page = 1) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reports/admin/all?page=${page}&pageSize=20`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
        setTotalPages(Math.ceil(data.total / 20));
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error('Erreur lors du chargement des signalements');
    }
  };

  const loadMusic = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/music?page=1&pageSize=1000`, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      
      if (res.ok) {
        const data = await res.json();
        setAllMusic(data.music);
        // Appliquer le filtre de recherche
        filterMusic(data.music, searchTerm);
      }
    } catch (error) {
      console.error('Error loading music:', error);
      toast.error('Erreur lors du chargement des musiques');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      
      if (res.ok) {
        toast.success('Utilisateur supprimé avec succès');
        loadUsers();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleRestoreUser = async (userId) => {
    if (!confirm('Êtes-vous sûr de vouloir restaurer cet utilisateur ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/users/${userId}/restore`, {
        method: 'PATCH',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      
      if (res.ok) {
        toast.success('Utilisateur restauré avec succès');
        loadUsers();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Erreur lors de la restauration');
      }
    } catch (error) {
      console.error('Error restoring user:', error);
      toast.error('Erreur lors de la restauration');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      
      if (res.ok) {
        toast.success('Commentaire supprimé avec succès');
        loadComments();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleDeleteMusic = async (musicId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette musique ?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/music/${musicId}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      
      if (res.ok) {
        toast.success('Musique supprimée avec succès !');
        loadMusic(); // Recharger la liste
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting music:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleRestoreMusic = async (musicId) => {
    if (!confirm('Êtes-vous sûr de vouloir restaurer cette musique ?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/music/${musicId}/restore`, {
        method: 'PATCH',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      
      if (res.ok) {
        toast.success('Musique restaurée avec succès !');
        loadMusic(); // Recharger la liste
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || 'Erreur lors de la restauration');
      }
    } catch (error) {
      console.error('Error restoring music:', error);
      toast.error('Erreur lors de la restauration');
    }
  };

  const handleToggleAdmin = async (userId, makeAdmin) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ isAdmin: !!makeAdmin })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(makeAdmin ? 'Utilisateur promu admin' : 'Rôle admin retiré');
        loadUsers();
      } else {
        toast.error(data.error || 'Erreur lors de la mise à jour du rôle');
      }
    } catch (error) {
      console.error('Error toggling admin:', error);
      toast.error('Erreur lors de la mise à jour du rôle');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // La recherche se fait automatiquement via le useEffect
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Scroll vers le haut de la liste pour voir les nouvelles musiques
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const deleteReport = async (reportId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reports/admin/${reportId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        toast.success('Signalement supprimé avec succès');
        loadReports(currentPage);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Erreur lors de la suppression du signalement');
    }
  };

  const updateReportStatus = async (reportId, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reports/admin/${reportId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        toast.success('Statut du signalement mis à jour');
        loadReports(currentPage);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Error updating report status:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  // Filtrer les musiques en temps réel quand searchTerm change
  useEffect(() => {
    filterMusic(allMusic, searchTerm);
    setCurrentPage(1); // Retour à la première page lors d'une recherche
  }, [searchTerm, allMusic]);

  // Initialiser filteredMusic quand allMusic change
  useEffect(() => {
    if (allMusic.length > 0) {
      setFilteredMusic(allMusic);
    }
  }, [allMusic]);

  // Debug: afficher les informations de pagination
  useEffect(() => {
    console.log('Debug pagination:', {
      currentPage,
      pageSize,
      totalFilteredMusic: filteredMusic.length,
      totalPagesCount,
      startIndex: (currentPage - 1) * pageSize,
      endIndex: currentPage * pageSize,
      displayedMusic: displayedMusic.length,
      allMusicCount: allMusic.length
    });
  }, [currentPage, filteredMusic, pageSize, totalPagesCount, displayedMusic, allMusic.length]);

  const filterMusic = (allMusic, searchTerm) => {
    if (!searchTerm) {
      setFilteredMusic(allMusic);
      return;
    }
    const filtered = allMusic.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.album?.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMusic(filtered);
  };

  const renderStats = () => (
    <div style={{ padding: '24px' }}>
      <h2 style={{ color: '#ff9100', marginBottom: '24px' }}>Statistiques du site</h2>
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div style={{ background: '#222', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', color: '#ff9100', fontWeight: 'bold' }}>{stats.users}</div>
            <div style={{ color: '#ccc' }}>Utilisateurs</div>
          </div>
          <div style={{ background: '#222', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', color: '#ff9100', fontWeight: 'bold' }}>{stats.music}</div>
            <div style={{ color: '#ccc' }}>Musiques</div>
          </div>
          <div style={{ background: '#222', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', color: '#ff9100', fontWeight: 'bold' }}>{stats.comments}</div>
            <div style={{ color: '#ccc' }}>Commentaires</div>
          </div>
          <div style={{ background: '#222', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', color: '#ff9100', fontWeight: 'bold' }}>{stats.favorites}</div>
            <div style={{ color: '#ccc' }}>Favoris</div>
          </div>
          <div style={{ background: '#222', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', color: '#ff9100', fontWeight: 'bold' }}>{stats.ratings}</div>
            <div style={{ color: '#ccc' }}>Notes</div>
          </div>
        </div>
      )}
    </div>
  );

  const renderUsers = () => (
    <div style={{ padding: '24px' }}>
      <h2 style={{ color: '#ff9100', marginBottom: '24px' }}>Gestion des utilisateurs</h2>
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {users.map(user => (
            <div key={user.id} style={{ 
              background: user.isDeleted ? '#2a1a1a' : '#222', 
              padding: '20px', 
              borderRadius: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              border: user.isDeleted ? '1px solid #ff4444' : 'none',
              opacity: user.isDeleted ? 0.7 : 1
            }}
              onMouseEnter={(e) => { 
                e.currentTarget.style.background = user.isDeleted ? '#3a2a2a' : '#2a2a2a'; 
              }}
              onMouseLeave={(e) => { 
                e.currentTarget.style.background = user.isDeleted ? '#2a1a1a' : '#222'; 
              }}>
              <div>
                <div style={{ 
                  fontWeight: 'bold', 
                  color: user.isDeleted ? '#ff8888' : '#fff',
                  textDecoration: user.isDeleted ? 'line-through' : 'none'
                }}>
                  {user.username}
                  {user.isDeleted && <span style={{ color: '#ff4444', marginLeft: '8px', fontSize: '0.8em' }}>[SUPPRIMÉ]</span>}
                </div>
                <div style={{ 
                  color: user.isDeleted ? '#ffaaaa' : '#ccc', 
                  fontSize: '0.9rem' 
                }}>
                  {user.email}
                </div>
                <div style={{ 
                  color: user.isDeleted ? '#ff8888' : '#999', 
                  fontSize: '0.8rem' 
                }}>
                  {user._count.favorites} favoris • {user._count.ratings} notes • {user._count.comments} commentaires
                </div>
                {user.isAdmin && <span style={{ color: '#ff9100', fontWeight: 'bold', marginRight: 12 }}>ADMIN</span>}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {!user.isDeleted ? (
                  <>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={user.isAdmin}
                      style={{
                        background: user.isAdmin ? '#333' : '#ff3e3e',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        cursor: user.isAdmin ? 'not-allowed' : 'pointer',
                        opacity: user.isAdmin ? 0.5 : 1,
                        fontSize: '0.8em'
                      }}
                    >
                      {user.isAdmin ? 'Impossible' : 'Supprimer'}
                    </button>
                    <button
                      onClick={() => handleToggleAdmin(user.id, !user.isAdmin)}
                      style={{
                        background: user.isAdmin ? '#444' : '#0ea5e9',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontSize: '0.8em'
                      }}
                    >
                      {user.isAdmin ? 'Retirer admin' : 'Rendre admin'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleRestoreUser(user.id)}
                    style={{
                      background: '#44ff44',
                      color: '#000',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      fontSize: '0.8em',
                      fontWeight: '600'
                    }}
                  >
                    Restaurer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderComments = () => (
    <div style={{ padding: '24px' }}>
      <h2 style={{ color: '#ff9100', marginBottom: '24px' }}>Gestion des commentaires</h2>
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {comments.map(comment => (
            <div key={comment.id} style={{ 
              background: '#222', 
              padding: '20px', 
              borderRadius: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#ff9100' }}>{comment.user.username}</div>
                  <div style={{ color: '#ccc', fontSize: '0.9rem' }}>{comment.music.title}</div>
                </div>
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  style={{
                    background: '#ff3e3e',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    cursor: 'pointer'
                  }}
                >
                  Supprimer
                </button>
              </div>
              <div style={{ color: '#fff', lineHeight: '1.6' }}>{comment.content}</div>
              <div style={{ color: '#999', fontSize: '0.8rem', marginTop: '8px' }}>
                {new Date(comment.createdAt).toLocaleDateString('fr-FR')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderMusic = () => (
    <div style={{ padding: '24px' }}>
      <h2 style={{ color: '#ff9100', marginBottom: '24px' }}>Gestion des musiques</h2>
      
      {/* Barre de recherche */}
      <div style={{ 
        marginBottom: '24px',
        display: 'flex',
        gap: '12px',
        alignItems: 'center'
      }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', flex: 1 }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher une musique ou un album..."
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
            style={{
              background: '#ff9100',
              color: '#18151c',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            🔍 Rechercher
          </button>
        </form>
        {searchTerm && (
          <button
            onClick={handleClearSearch}
            style={{
              background: '#666',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 16px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            ✕ Effacer
          </button>
        )}
      </div>

      {/* Informations de pagination */}
      <div style={{ 
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#ccc',
        fontSize: '0.9rem'
      }}>
        <span>
          {searchTerm ? (
            <>
              Recherche : "{searchTerm}" - {filteredMusic.length} résultat{filteredMusic.length > 1 ? 's' : ''} trouvé{filteredMusic.length > 1 ? 's' : ''}
            </>
          ) : (
            <>
              Page {currentPage} sur {totalPagesCount} 
            </>
          )}
        </span>
        <span>
          {displayedMusic.length} musiques affichées sur {filteredMusic.length} filtrées ({allMusic.length} total)
        </span>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            {displayedMusic.map(item => (
              <div key={item.id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px', 
                padding: '16px', 
                background: item.isDeleted ? '#2a1a1a' : '#1a1a1a', 
                borderRadius: '8px', 
                border: item.isDeleted ? '1px solid #ff4444' : '1px solid #333',
                opacity: item.isDeleted ? 0.7 : 1
              }}
                onMouseEnter={(e) => { 
                  e.currentTarget.style.background = item.isDeleted ? '#3a2a2a' : '#2a2a2a'; 
                }} 
                onMouseLeave={(e) => { 
                  e.currentTarget.style.background = item.isDeleted ? '#2a1a1a' : '#1a1a1a'; 
                }}>
                <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => { 
                  if (!item.isDeleted) {
                    navigate(`/music/${item.mbid}/${encodeURIComponent(item.title)}/${encodeURIComponent(item.album?.title || 'Unknown')}/${encodeURIComponent(item.album?.coverUrl || '')}`);
                  }
                }}>
                  {item.album?.coverUrl && (
                    <img src={item.album.coverUrl} alt={item.title} style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '4px', 
                      objectFit: 'cover',
                      filter: item.isDeleted ? 'grayscale(100%)' : 'none'
                    }} />
                  )}
                  <div>
                    <div style={{ 
                      fontWeight: '600', 
                      color: item.isDeleted ? '#ff8888' : '#fff',
                      textDecoration: item.isDeleted ? 'line-through' : 'none'
                    }}>
                      {item.title}
                      {item.isDeleted && <span style={{ color: '#ff4444', marginLeft: '8px', fontSize: '0.8em' }}>[SUPPRIMÉE]</span>}
                    </div>
                    <div style={{ 
                      color: item.isDeleted ? '#ffaaaa' : '#ccc', 
                      fontSize: '0.9em' 
                    }}>
                      {item.album?.title || 'Album inconnu'}
                    </div>
                  </div>
                  <div style={{ 
                    color: item.isDeleted ? '#ff8888' : '#999', 
                    fontSize: '0.8em' 
                  }}>
                    {item._count.users} favoris • {item._count.ratings} notes • {item._count.comments} commentaires
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {!item.isDeleted ? (
                    <>
                      <button onClick={(e) => { 
                        e.stopPropagation(); 
                        navigate(`/music/${item.mbid}/${encodeURIComponent(item.title)}/${encodeURIComponent(item.album?.title || 'Unknown')}/${encodeURIComponent(item.album?.coverUrl || '')}`);
                      }} style={{ 
                        background: '#ff9100', 
                        border: 'none', 
                        color: '#000', 
                        padding: '6px 12px', 
                        borderRadius: '4px', 
                        cursor: 'pointer',
                        fontSize: '0.8em'
                      }} title="Voir les détails">Voir</button>
                      <button onClick={(e) => { 
                        e.stopPropagation(); 
                        handleDeleteMusic(item.id); 
                      }} style={{ 
                        background: '#ff4444', 
                        border: 'none', 
                        color: '#fff', 
                        padding: '6px 12px', 
                        borderRadius: '4px', 
                        cursor: 'pointer',
                        fontSize: '0.8em'
                      }} title="Supprimer cette musique">Supprimer</button>
                    </>
                  ) : (
                    <button onClick={(e) => { 
                      e.stopPropagation(); 
                      handleRestoreMusic(item.id); 
                    }} style={{ 
                      background: '#44ff44', 
                      border: 'none', 
                      color: '#000', 
                      padding: '6px 12px', 
                      borderRadius: '4px', 
                      cursor: 'pointer',
                      fontSize: '0.8em'
                    }} title="Restaurer cette musique">Restaurer</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPagesCount > 1 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '12px',
              marginTop: '24px'
            }}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  background: currentPage === 1 ? '#333' : '#ff9100',
                  color: currentPage === 1 ? '#666' : '#18151c',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 20px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  opacity: currentPage === 1 ? 0.5 : 1
                }}
              >
                ← Précédent
              </button>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                color: '#ccc'
              }}>
                {(() => {
                  const startPage = Math.max(1, Math.min(totalPagesCount - 4, currentPage - 2));
                  const endPage = Math.min(totalPagesCount, startPage + 4);
                  
                  return Array.from({ length: endPage - startPage + 1 }, (_, i) => {
                    const pageNum = startPage + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        style={{
                          background: pageNum === currentPage ? '#ff9100' : '#333',
                          color: pageNum === currentPage ? '#18151c' : '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          minWidth: '40px'
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  });
                })()}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPagesCount}
                style={{
                  background: currentPage >= totalPagesCount ? '#333' : '#ff9100',
                  color: currentPage >= totalPagesCount ? '#666' : '#18151c',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 20px',
                  cursor: currentPage >= totalPagesCount ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  opacity: currentPage >= totalPagesCount ? 0.5 : 1
                }}
              >
                Suivant →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );

  useEffect(() => {
    // Vérifier s'il y a un onglet cible stocké (depuis les notifications)
    const targetTab = localStorage.getItem('adminTargetTab');
    if (targetTab) {
      setActiveTab(targetTab);
      localStorage.removeItem('adminTargetTab'); // Nettoyer après utilisation
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#18151c' }}>
      <Header />
      <main style={{ maxWidth: 1200, margin: '0 auto', color: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 0 32px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
            <div>
              <h1 style={{ fontWeight: 900, fontSize: '2.5rem', marginBottom: 8 }}>Panel Administrateur</h1>
              <p style={{ color: '#d1d1d6', fontSize: '1.1rem', margin: 0 }}>Gérez votre site</p>
            </div>
            <button 
              onClick={handleSmartBack}
              style={{
                background: 'none',
                border: '2px solid #ff9100',
                color: '#ff9100',
                padding: '12px 24px',
                borderRadius: 8,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.target.style.background = '#ff9100';
                e.target.style.color = '#18151c';
              }}
              onMouseLeave={e => {
                e.target.style.background = 'none';
                e.target.style.color = '#ff9100';
              }}
            >
              ← Retour
            </button>
          </div>
        </div>
        
        {/* Onglets */}
        <div style={{
          display: 'flex',
          gap: '2px',
          background: '#333',
          borderRadius: '8px',
          padding: '4px',
          marginBottom: '30px'
        }}>
          <button
            onClick={() => setActiveTab('stats')}
            style={{
              padding: '12px 24px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'stats' ? '#ff9100' : 'transparent',
              color: activeTab === 'stats' ? '#000' : '#fff',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}
          >
            Statistiques
          </button>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '12px 24px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'users' ? '#ff9100' : 'transparent',
              color: activeTab === 'users' ? '#000' : '#fff',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}
          >
            Gestion des utilisateurs
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            style={{
              padding: '12px 24px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'comments' ? '#ff9100' : 'transparent',
              color: activeTab === 'comments' ? '#000' : '#fff',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}
          >
            Gestion des commentaires
          </button>
          <button
            onClick={() => setActiveTab('music')}
            style={{
              padding: '12px 24px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'music' ? '#ff9100' : 'transparent',
              color: activeTab === 'music' ? '#000' : '#fff',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}
          >
            Gestion des musiques
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            style={{
              padding: '12px 24px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'reports' ? '#ff9100' : 'transparent',
              color: activeTab === 'reports' ? '#000' : '#fff',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}
          >
            Signalements
          </button>
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'stats' && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#ff9100', marginBottom: '30px' }}>Statistiques du site</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginBottom: '30px'
            }}>
              <div style={{
                background: '#1a1a1a',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #333'
              }}>
                <div style={{ fontSize: '2rem', color: '#ff9100', fontWeight: 'bold' }}>{stats.users || 0}</div>
                <div style={{ color: '#ccc' }}>Utilisateurs</div>
              </div>
              <div style={{
                background: '#1a1a1a',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #333'
              }}>
                <div style={{ fontSize: '2rem', color: '#ff9100', fontWeight: 'bold' }}>{stats.music || 0}</div>
                <div style={{ color: '#ccc' }}>Musiques</div>
              </div>
              <div style={{
                background: '#1a1a1a',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #333'
              }}>
                <div style={{ fontSize: '2rem', color: '#ff9100', fontWeight: 'bold' }}>{stats.comments || 0}</div>
                <div style={{ color: '#ccc' }}>Commentaires</div>
              </div>
              <div style={{
                background: '#1a1a1a',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #333'
              }}>
                <div style={{ fontSize: '2rem', color: '#ff9100', fontWeight: 'bold' }}>{stats.favorites || 0}</div>
                <div style={{ color: '#ccc' }}>Favoris</div>
              </div>
              <div style={{
                background: '#1a1a1a',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #333'
              }}>
                <div style={{ fontSize: '2rem', color: '#ff9100', fontWeight: 'bold' }}>{stats.ratings || 0}</div>
                <div style={{ color: '#ccc' }}>Notes</div>
              </div>
              <div style={{
                background: '#1a1a1a',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #333'
              }}>
                <div style={{ fontSize: '2rem', color: '#ff9100', fontWeight: 'bold' }}>{stats.blocks || 0}</div>
                <div style={{ color: '#ccc' }}>Blocages</div>
              </div>
              <div style={{
                background: '#1a1a1a',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #333'
              }}>
                <div style={{ fontSize: '2rem', color: '#ff9100', fontWeight: 'bold' }}>{stats.reports || 0}</div>
                <div style={{ color: '#ccc' }}>Signalements</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div>
            <h2 style={{ color: '#ff9100', marginBottom: '20px' }}>Gestion des signalements</h2>
            
            {reports.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                Aucun signalement pour le moment
              </div>
            ) : (
              <div style={{ background: '#1a1a1a', borderRadius: '12px', padding: '20px' }}>
                {reports.map((reportGroup) => (
                  <div key={reportGroup.reportedUserId} style={{
                    background: '#2a2a2a',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '12px',
                    border: '1px solid #333',
                    transition: 'all 0.2s ease'
                  }}>
                    {/* En-tête compact du signalement */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                    onClick={() => toggleReportExpansion(reportGroup.reportedUserId)}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '12px',
                          marginBottom: '4px'
                        }}>
                          <h3 style={{ color: '#fff', margin: '0', fontSize: '1.1rem' }}>
                            {reportGroup.reportedUsername}
                          </h3>
                          {reportGroup.isDeleted && (
                            <span style={{ 
                              color: '#ff4444', 
                              fontSize: '0.7rem',
                              fontStyle: 'italic'
                            }}>
                              (Supprimé)
                            </span>
                          )}
                          <span style={{ 
                            fontSize: '0.8rem',
                            color: '#999'
                          }}>
                            {expandedReports.has(reportGroup.reportedUserId) ? '▼' : '▶'}
                          </span>
                        </div>
                        <div style={{ color: '#ccc', fontSize: '0.85rem' }}>
                          {reportGroup.totalReports} signalement(s) • {formatDate(reportGroup.latestReport.createdAt)}
                        </div>
                      </div>
                      
                      {/* Actions rapides */}
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            updateReportStatus(reportGroup.latestReport.id, 'reviewed');
                          }}
                          disabled={reportGroup.latestReport.status !== 'pending'}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: 'none',
                            background: reportGroup.latestReport.status === 'pending' ? '#4a90e2' : '#666',
                            color: '#fff',
                            cursor: reportGroup.latestReport.status === 'pending' ? 'pointer' : 'not-allowed',
                            fontSize: '0.7rem'
                          }}
                        >
                          Examiner
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            updateReportStatus(reportGroup.latestReport.id, 'resolved');
                          }}
                          disabled={reportGroup.latestReport.status === 'resolved'}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: 'none',
                            background: reportGroup.latestReport.status === 'resolved' ? '#666' : '#4caf50',
                            color: '#fff',
                            cursor: reportGroup.latestReport.status === 'resolved' ? 'not-allowed' : 'pointer',
                            fontSize: '0.7rem'
                          }}
                        >
                          Résoudre
                        </button>
                      </div>
                    </div>

                    {/* Informations détaillées (affichées seulement au clic) */}
                    {expandedReports.has(reportGroup.reportedUserId) && (
                      <div style={{ 
                        marginTop: '16px',
                        paddingTop: '16px',
                        borderTop: '1px solid #444'
                      }}>
                        {/* Liste de tous les signalements */}
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ color: '#ccc', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem' }}>
                            Tous les signalements ({reportGroup.totalReports})
                          </div>
                          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {reportGroup.allReports.map((report) => (
                              <div key={report.id} style={{
                                background: '#444',
                                borderRadius: '4px',
                                padding: '10px',
                                marginBottom: '6px',
                                borderLeft: '3px solid #ff9100'
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ color: '#fff', marginBottom: '3px', fontSize: '0.85rem' }}>
                                      <strong>Raison:</strong> {report.reason}
                                    </div>
                                    {report.description && (
                                      <div style={{ color: '#ccc', fontSize: '0.8rem', marginBottom: '3px' }}>
                                        {report.description}
                                      </div>
                                    )}
                                    <div style={{ color: '#999', fontSize: '0.75rem' }}>
                                      Signalé par {report.reporterUsername} • {formatDate(report.createdAt)}
                                    </div>
                                  </div>
                                  <div style={{ marginLeft: '8px' }}>
                                    <span style={{
                                      padding: '2px 6px',
                                      borderRadius: '10px',
                                      fontSize: '0.65rem',
                                      fontWeight: '600',
                                      background: getStatusColor(report.status),
                                      color: '#fff'
                                    }}>
                                      {getStatusText(report.status)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Actions sur le groupe */}
                        <div style={{
                          display: 'flex',
                          gap: '8px',
                          justifyContent: 'flex-end'
                        }}>
                          <button 
                            onClick={() => updateReportStatus(reportGroup.latestReport.id, 'dismissed')}
                            disabled={reportGroup.latestReport.status === 'dismissed'}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '4px',
                              border: 'none',
                              background: reportGroup.latestReport.status === 'dismissed' ? '#666' : '#ff9800',
                              color: '#fff',
                              cursor: reportGroup.latestReport.status === 'dismissed' ? 'not-allowed' : 'pointer',
                              fontSize: '0.8rem'
                            }}
                          >
                            Rejeter
                          </button>
                          <button 
                            onClick={() => deleteReport(reportGroup.latestReport.id)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '4px',
                              border: 'none',
                              background: '#ff4444',
                              color: '#fff',
                              cursor: 'pointer',
                              fontSize: '0.8rem'
                            }}
                          >
                            Supprimer le groupe
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '20px'
                  }}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => loadReports(page)}
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
              </div>
            )}
          </div>
        )}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'comments' && renderComments()}
        {activeTab === 'music' && renderMusic()}
      </main>
    </div>
  );
} 