import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { toast } from 'react-toastify';

export default function Profile() {
	const navigate = useNavigate();
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	const [favorites, setFavorites] = useState([]);
	const [favPage, setFavPage] = useState(1);
	const [favPageSize] = useState(5);
	const [favTotal, setFavTotal] = useState(0);
	const [favLoading, setFavLoading] = useState(false);
	const [favError, setFavError] = useState('');
	const [favToast, setFavToast] = useState('');
	const fetchedPages = useRef(new Set());

	const [confirmOpen, setConfirmOpen] = useState(false);
	const [pendingDeleteId, setPendingDeleteId] = useState(null);

	const [recentRatings, setRecentRatings] = useState([]);
	const [ratingsError, setRatingsError] = useState('');
	const [ratingsLoading, setRatingsLoading] = useState(false);

	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [itemToDelete, setItemToDelete] = useState(null);

	const setRatingApi = async ({ mbid, title, albumMbid, albumTitle, coverUrl, value }) => {
		try {
			const token = localStorage.getItem('token');
			if (!token) return false;
			const res = await fetch('/api/ratings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
				body: JSON.stringify({ mbid, title, albumMbid, albumTitle, coverUrl, value })
			});
			return res.ok;
		} catch {
			return false;
		}
	};

	// Fonctions pour les favoris
	const addToFavorites = async (musicId, title, albumTitle, coverUrl) => {
		try {
			const response = await fetch('/api/music/favorites', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('token')}`
				},
				body: JSON.stringify({ 
					mbid: musicId, 
					title, 
					albumMbid: musicId, 
					albumTitle, 
					coverUrl 
				})
			});

			if (response.ok) {
				toast.success('Ajouté aux favoris !');
				// Recharger les favoris
				fetchFavorites();
			} else {
				toast.error('Erreur lors de l\'ajout aux favoris');
			}
		} catch (error) {
			console.error('Error adding to favorites:', error);
			toast.error('Erreur lors de l\'ajout aux favoris');
		}
	};

	const removeFromFavorites = async (id) => {
		try {
			const response = await fetch(`/api/music/favorites/${id}`, {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('token')}`
				}
			});

			if (response.ok) {
				toast.success('Retiré des favoris !');
				setFavorites(prev => prev.filter(item => item.id !== id));
				setShowDeleteModal(false);
				setItemToDelete(null);
			} else {
				toast.error('Erreur lors de la suppression');
			}
		} catch (error) {
			console.error('Error removing from favorites:', error);
			toast.error('Erreur lors de la suppression');
		}
	};

	// Fonctions pour les notes
	const setRating = async (musicId, rating, title, albumTitle, coverUrl) => {
		try {
			const response = await fetch('/api/ratings', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('token')}`
				},
				body: JSON.stringify({ 
					mbid: musicId, 
					title, 
					albumMbid: musicId, 
					albumTitle, 
					coverUrl, 
					value: rating 
				})
			});

			if (response.ok) {
				// Vérifier si c'est une nouvelle note ou une modification
				const existingRating = recentRatings.find(r => (r.mbid || r.id) === musicId);
				if (existingRating && existingRating.value !== rating) {
					toast.success(`Note modifiée de ${existingRating.value}★ à ${rating}★ !`);
				} else {
					toast.success(`Note ${rating}/5 enregistrée !`);
				}
				// Recharger les notes récentes
				fetchRecentRatings();
			} else {
				toast.error('Erreur lors de l\'enregistrement de la note');
			}
		} catch (error) {
			console.error('Error setting rating:', error);
			toast.error('Erreur lors de l\'enregistrement de la note');
		}
	};

	const fetchRecentRatings = async () => {
		try {
			const token = localStorage.getItem('token');
			if (!token) return;
			
			const response = await fetch('/api/ratings/recent?take=5', {
				headers: { 'Authorization': `Bearer ${token}` }
			});
			
			if (response.ok) {
				const data = await response.json();
				console.log('Recent ratings data:', data); // Debug
				console.log('Recent ratings items:', data.items); // Debug des items
				if (data.items && data.items.length > 0) {
					console.log('First rating item:', data.items[0]); // Debug du premier item
				}
				setRecentRatings(data.items || []);
			} else {
				throw new Error('Failed to fetch ratings');
			}
		} catch (error) {
			console.error('Error fetching recent ratings:', error);
			setRatingsError(error.message || 'Error');
		}
	};

	useEffect(() => {
		const token = localStorage.getItem('token');
		if (!token) {
			setError('Not authenticated');
			setLoading(false);
			return;
		}
		fetch('/api/users/profile', {
			headers: {
				'Authorization': 'Bearer ' + token,
			},
		})
			.then(res => {
				if (res.ok) return res.json();
				throw new Error('Failed to fetch profile');
			})
			.then(data => {
				setUser(data.user);
				setLoading(false);
			})
			.catch(err => {
				setError(err.message || 'Error');
				setLoading(false);
			});
	}, []);

	useEffect(() => {
		const token = localStorage.getItem('token');
		if (!token) return;
		if (fetchedPages.current.has(favPage)) return; // évite double fetch (StrictMode)
		setFavLoading(true);
		setFavError('');
		fetch(`/api/music/favorites?page=${favPage}&pageSize=${favPageSize}`, {
			headers: {
				'Authorization': 'Bearer ' + token,
			},
		})
			.then(res => {
				if (res.ok) return res.json();
				throw new Error('Failed to fetch favorites');
			})
			.then(data => {
				console.log('Favorites data:', data); // Debug
				console.log('Favorites items structure:', data.items); // Debug de la structure
				if (data.items && data.items.length > 0) {
					console.log('First favorite item:', data.items[0]); // Debug du premier favori
				}
				setFavorites(prev => {
					// Si c'est la première page, remplacer complètement
					if (favPage === 1) {
						return data.items || [];
					}
					// Sinon, ajouter aux existants
					const existing = new Set(prev.map(i => i.id));
					const merged = [...prev, ...(data.items || []).filter(i => !existing.has(i.id))];
					console.log('Merged favorites:', merged); // Debug
					return merged;
				});
				setFavTotal(data.total || 0);
				fetchedPages.current.add(favPage);
			})
			.catch(err => setFavError(err.message || 'Error'))
			.finally(() => setFavLoading(false));
	}, [favPage, favPageSize]);

	// Vérifier si une musique est dans les favoris
	const isInFavorites = (musicId, title, artist) => {
		return favorites.some(fav => {
			// Comparer par titre et artiste (plus stable que les IDs)
			const titleMatch = fav.title === title || fav.music?.title === title;
			const artistMatch = fav.albumTitle === artist || fav.music?.album?.title === artist;
			return titleMatch && artistMatch;
		});
	};

	useEffect(() => {
		const token = localStorage.getItem('token');
		if (!token) return;
		setRatingsLoading(true);
		setRatingsError('');
		fetchRecentRatings();
	}, []);

	const canLoadMore = favorites.length < favTotal;

	const requestDelete = (favoriteId) => {
		setPendingDeleteId(favoriteId);
		setConfirmOpen(true);
	};

	const cancelDelete = () => {
		setConfirmOpen(false);
		setPendingDeleteId(null);
	};

	const confirmDelete = async () => {
		if (!pendingDeleteId) return;
		try {
			const token = localStorage.getItem('token');
			if (!token) return;
			const res = await fetch(`/api/music/favorites/${pendingDeleteId}`, {
				method: 'DELETE',
				headers: { 'Authorization': 'Bearer ' + token },
			});
			if (!res.ok) throw new Error('Échec de la suppression');
			setFavorites(list => list.filter(f => f.id !== pendingDeleteId));
			setFavTotal(t => Math.max(0, t - 1));
			setFavToast('Supprimé des favoris');
			setTimeout(() => setFavToast(''), 1600);
		} catch (e) {
			setFavToast(e.message || 'Erreur');
			setTimeout(() => setFavToast(''), 1600);
		} finally {
			setConfirmOpen(false);
			setPendingDeleteId(null);
		}
	};

	return (
		<div style={{ minHeight: '100vh', background: '#18151c' }}>
			<Header />
			{favToast && (
				<div style={{
					position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
					background: 'rgba(0,0,0,0.85)', color: '#fff', padding: '10px 14px', borderRadius: 8, zIndex: 9999,
				}}>{favToast}</div>
			)}

			{/* Modal de confirmation */}
			{confirmOpen && (
				<div style={{
					position: 'fixed', inset: 0, zIndex: 9998,
					background: 'rgba(0,0,0,0.35)',
					backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)'
				}}>
					<div style={{
						position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
						background: '#000', // proche du fond de Home
						border: '1px solid rgba(255,255,255,0.15)',
						borderRadius: 12,
						padding: 18,
						minWidth: 300,
						boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
					}}>
						<div style={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem', marginBottom: 8 }}>Confirmation</div>
						<div style={{ color: '#eaeaea', marginBottom: 14 }}>Êtes-vous sûr de vouloir supprimer ce favori ?</div>
						<div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
							<button onClick={cancelDelete} style={{
								background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.25)',
								borderRadius: 8, padding: '8px 12px', cursor: 'pointer'
							}}>Annuler</button>
							<button onClick={confirmDelete} style={{
								background: '#ff9100', color: '#18151c', border: 'none',
								borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontWeight: 800
							}}>Supprimer</button>
						</div>
					</div>
				</div>
			)}

			<main style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px', color: '#fff' }}>
				<h1 style={{ margin: '16px 0 24px', color: '#ff9100' }}>Profile</h1>
				{loading && <p>Loading...</p>}
				{!loading && error && <p style={{ color: '#ff3e3e' }}>{error}</p>}
				{!loading && !error && user && (
					<>
						<div style={{
							background: 'rgba(255,255,255,0.04)',
							border: '1px solid rgba(255,255,255,0.08)',
							borderRadius: 12,
							padding: 16,
							maxWidth: 560,
							marginBottom: 20,
						}}>
							<div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
								<div style={{
									width: 56,
									height: 56,
									borderRadius: '50%',
									background: '#ff9100',
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									color: '#18151c',
									fontWeight: 700,
									fontSize: '1.25rem',
								}}>
									{user.username?.charAt(0)?.toUpperCase()}
								</div>
								<div>
									<div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{user.username}</div>
									<div style={{ opacity: 0.85 }}>{user.email}</div>
								</div>
							</div>
						</div>

						{/* Dernières notes (en-tête + séparateur + rangée) */}
						<div style={{ maxWidth: 1200, margin: '0 auto', marginBottom: 16 }}>
							<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
								<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: 1030, marginBottom: 8 }}>
									<h2 style={{ fontWeight: 400, fontSize: '1.25rem', letterSpacing: 0.2, color: '#d1d1d6', margin: 0 }}>Dernières notes</h2>
									<button onClick={() => navigate('/ratings')} style={{ background: 'transparent', color: '#ff9100', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Voir plus</button>
								</div>
								<div style={{ width: 1030, height: 2, background: 'linear-gradient(90deg, #333 0%, #444 100%)', marginBottom: 18, opacity: 0.7 }} />
								
								{!ratingsLoading && ratingsError && <p style={{ color: '#ff3e3e' }}>{ratingsError}</p>}
								{!ratingsLoading && !ratingsError && recentRatings.length === 0 && (
									<p style={{ opacity: 0.8 }}>Aucune note récente.</p>
								)}
								{recentRatings.length > 0 && (
									<div style={{ display: 'flex', gap: 28, paddingBottom: 8, width: 1030, justifyContent: 'flex-start' }}>
										{recentRatings.slice(0, 5).map(r => (
											<div key={r.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
												{/* Carte de musique */}
												<div style={{ position: 'relative', minWidth: 150, width: 150, height: 260, borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px 0 rgba(0,0,0,0.10)', background: '#222', cursor: 'pointer', transition: 'box-shadow 0.18s, border 0.18s', border: '2.5px solid transparent' }}>
													{r.coverUrl ? (
														<img src={r.coverUrl} alt={r.title || 'Titre inconnu'} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
													) : (
														<div style={{ width: '100%', height: '100%', background: '#444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '0.8rem' }}>
															Pas d'image
														</div>
													)}
													<div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '0 0 8px 0', background: 'linear-gradient(0deg, rgba(24,21,28,0.92) 70%, rgba(24,21,28,0.0) 100%)', color: '#fff', textAlign: 'center' }}>
														<div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 2, textShadow: '0 2px 8px rgba(0,0,0,0.18)' }}>{r.title || 'Titre inconnu'}</div>
														{r.albumTitle && <div style={{ color: '#ff9100', fontWeight: 600, fontSize: '0.98rem', textShadow: '0 2px 8px rgba(0,0,0,0.18)' }}>{r.albumTitle}</div>}
													</div>
													
													{/* Système de favoris - cœur vide ou plein selon l'état */}
													<button
														onClick={(e) => {
															e.stopPropagation();
															const musicId = r.mbid || r.id;
															if (isInFavorites(musicId, r.title, r.albumTitle || r.title)) {
																// Si c'est déjà un favori, le retirer via popup
																const favoriteItem = favorites.find(fav => fav.musicId === musicId || fav.music?.mbid === musicId || fav.music?.id === musicId);
																if (favoriteItem) {
																	requestDelete(favoriteItem.id);
																}
															} else {
																// Sinon l'ajouter
																addToFavorites(musicId, r.title, r.albumTitle || r.title, r.coverUrl);
															}
														}}
														style={{
															position: 'absolute',
															bottom: 8,
															right: 8,
															background: 'none',
															border: 'none',
															cursor: 'pointer',
															padding: 0,
															fontSize: '20px',
															color: isInFavorites(r.mbid || r.id, r.title, r.albumTitle || r.title) ? '#ff3e3e' : '#fff',
															textShadow: '0 2px 4px rgba(0,0,0,0.8)',
															zIndex: 5
														}}
													>
														{isInFavorites(r.mbid || r.id, r.title, r.albumTitle || r.title) ? '♥' : '♡'}
													</button>
												</div>
												
												{/* Étoiles de notation sous la carte */}
												<div style={{ width: 150, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
													<div style={{ display: 'flex', gap: 2 }}>
														{[1, 2, 3, 4, 5].map(star => (
															<button
																key={star}
																onClick={() => {
																	setRating(r.mbid || r.id, star, r.title, r.albumTitle, r.coverUrl);
																}}
																style={{
																	background: 'none',
																	border: 'none',
																	cursor: 'pointer',
																	padding: 0,
																	fontSize: '14px',
																	color: star <= (r.value || 0) ? '#ffd700' : '#666',
																	transition: 'color 0.2s'
																}}
															>
																★
															</button>
														))}
													</div>
													<div style={{ fontSize: '0.75rem', color: '#999', marginTop: 4, textAlign: 'center' }}>
														Cliquez pour modifier
													</div>
												</div>
											</div>
										))}
									</div>
								)}
								
							</div>
						</div>

						{/* Favoris (en-tête + séparateur + rangée) */}
						<div style={{ maxWidth: 1200, margin: '0 auto' }}>
							<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
								<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: 1030, marginBottom: 8 }}>
									<h2 style={{ fontWeight: 400, fontSize: '1.25rem', letterSpacing: 0.2, color: '#d1d1d6', margin: 0 }}>Favoris</h2>
									<button onClick={() => navigate('/favorites')} style={{ background: 'transparent', color: '#ff9100', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Voir plus</button>
								</div>
								<div style={{ width: 1030, height: 2, background: 'linear-gradient(90deg, #333 0%, #444 100%)', marginBottom: 18, opacity: 0.7 }} />
								{favLoading && favorites.length === 0 && <p>Loading...</p>}
								{favError && <p style={{ color: '#ff3e3e' }}>{favError}</p>}
								{favorites.length === 0 && !favLoading && !favError && (
									<div style={{ padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px dashed rgba(255,255,255,0.12)' }}>
										<p style={{ margin: 0, opacity: 0.85 }}>Aucune musique aimée pour le moment.</p>
										<p style={{ margin: '6px 0 0', opacity: 0.65, fontSize: '0.95rem' }}>Vos morceaux aimés apparaîtront ici.</p>
									</div>
								)}
								{favorites.length > 0 && (
									<div style={{ display: 'flex', gap: 28, paddingBottom: 8, width: 1030, justifyContent: 'flex-start' }}>
										{favorites.slice(0, 5).map(item => (
											<div key={item.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
												{/* Carte de musique */}
												<div style={{ position: 'relative', minWidth: 150, width: 150, height: 260, borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px 0 rgba(0,0,0,0.10)', background: '#222', cursor: 'pointer', transition: 'box-shadow 0.18s, border 0.18s', border: '2.5px solid transparent' }}>
													{item.music?.album?.coverUrl || item.coverUrl ? (
														<img src={item.music?.album?.coverUrl || item.coverUrl} alt={item.music?.title || item.title || 'Titre inconnu'} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
													) : (
														<div style={{ width: '100%', height: '100%', background: '#444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '0.8rem' }}>
															Pas d'image
														</div>
													)}
													<div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '0 0 8px 0', background: 'linear-gradient(0deg, rgba(24,21,28,0.92) 70%, rgba(24,21,28,0.0) 100%)', color: '#fff', textAlign: 'center' }}>
														<div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 2, textShadow: '0 2px 8px rgba(0,0,0,0.18)' }}>{item.music?.title || item.title || 'Titre inconnu'}</div>
														{(item.music?.album?.title || item.albumTitle) && <div style={{ color: '#ff9100', fontWeight: 600, fontSize: '0.98rem', textShadow: '0 2px 8px rgba(0,0,0,0.18)' }}>{item.music?.album?.title || item.albumTitle}</div>}
													</div>
													
													{/* Système de favoris - cœur plein en bas à droite */}
													<button
														onClick={(e) => {
															e.stopPropagation();
															requestDelete(item.id);
														}}
														style={{
															position: 'absolute',
															bottom: 8,
															right: 8,
															background: 'none',
															border: 'none',
															cursor: 'pointer',
															padding: 0,
															fontSize: '20px',
															color: '#ff3e3e',
															textShadow: '0 2px 4px rgba(0,0,0,0.8)',
															zIndex: 5
														}}
													>
														♥
													</button>
												</div>
												
												{/* Étoiles de notation sous la carte */}
												<div style={{ width: 150, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
													<div style={{ display: 'flex', gap: 2 }}>
														{[1, 2, 3, 4, 5].map(star => (
															<button
																key={star}
																onClick={() => {
																	setRating(item.musicId || item.music?.mbid || item.music?.id, star, item.music?.title || item.title, item.music?.album?.title || item.albumTitle, item.music?.album?.coverUrl || item.coverUrl);
																}}
																style={{
																	background: 'none',
																	border: 'none',
																	cursor: 'pointer',
																	padding: 0,
																	fontSize: '14px',
																	color: star <= (item.value || 0) ? '#ffd700' : '#666',
																	transition: 'color 0.2s'
																}}
															>
																★
															</button>
														))}
													</div>
													<div style={{ fontSize: '0.75rem', color: '#999', marginTop: 4, textAlign: 'center' }}>
														Cliquez pour modifier
													</div>
												</div>
											</div>
										))}
									</div>
								)}
								
							</div>
						</div>
					</>
				)}
			</main>
		</div>
	);
}
