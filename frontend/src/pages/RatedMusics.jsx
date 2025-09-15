import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Header from '../components/Header';

export default function RatedMusics() {
	const [items, setItems] = useState([]);
	const [favorites, setFavorites] = useState([]);
	const [page, setPage] = useState(1);
	const [pageSize] = useState(12);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [itemToDelete, setItemToDelete] = useState(null);
	const fetchedPages = useRef(new Set());
	const navigate = useNavigate();

	// Charger les notes
	useEffect(() => {
		const token = localStorage.getItem('token');
		if (!token) return;
		if (fetchedPages.current.has(page)) return;
		setLoading(true);
		setError('');
		fetch(`/api/ratings?page=${page}&pageSize=${pageSize}`, {
			headers: { 'Authorization': 'Bearer ' + token }
		})
			.then(res => { if (res.ok) return res.json(); throw new Error('Failed to fetch ratings'); })
			.then(data => {
				setItems(prev => {
					const seen = new Set(prev.map(i => i.id));
					const merged = [...prev, ...(data.items || []).filter(i => !seen.has(i.id))];
					return merged;
				});
				setTotal(data.total || 0);
				fetchedPages.current.add(page);
			})
			.catch(err => setError(err.message || 'Error'))
			.finally(() => setLoading(false));
	}, [page, pageSize]);

	// Charger les favoris
	useEffect(() => {
		const token = localStorage.getItem('token');
		if (!token) return;
		
		fetch('/api/music/favorites?page=1&pageSize=100', {
			headers: { 'Authorization': 'Bearer ' + token }
		})
			.then(res => res.json())
			.then(data => {
				if (data.items) {
					setFavorites(data.items);
				}
			})
			.catch(err => console.error('Error loading favorites:', err));
	}, []);

	// Vérifier si une musique est dans les favoris
	const isInFavorites = (musicId, title, artist) => {
		return favorites.some(fav => {
			// Comparer par titre et artiste (plus stable que les IDs)
			const titleMatch = fav.title === title || fav.music?.title === title;
			const artistMatch = fav.albumTitle === artist || fav.music?.album?.title === artist;
			return titleMatch && artistMatch;
		});
	};

	// Ajouter aux favoris
	const addToFavorites = async (musicId, title, artist = null, coverUrl = null) => {
		try {
			const token = localStorage.getItem('token');
			if (!token) {
				toast('Veuillez vous connecter.');
				return;
			}

			const res = await fetch('/api/music/favorites', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + token,
				},
				body: JSON.stringify({ musicId, title, artist, coverUrl }),
			});

			if (res.ok) {
				toast('Ajouté aux favoris !');
				// Recharger les favoris
				const token = localStorage.getItem('token');
				fetch('/api/music/favorites?page=1&pageSize=100', {
					headers: { 'Authorization': 'Bearer ' + token }
				})
					.then(res => res.json())
					.then(data => {
						if (data.items) {
							setFavorites(data.items);
						}
					});
			} else {
				toast('Erreur lors de l\'ajout aux favoris');
			}
		} catch (error) {
			console.error('Error adding to favorites:', error);
			toast('Erreur lors de l\'ajout aux favoris');
		}
	};

	// Noter une musique
	const setRating = async (musicId, rating, title, albumTitle, coverUrl) => {
		try {
			const token = localStorage.getItem('token');
			if (!token) {
				toast('Veuillez vous connecter.');
				return;
			}

			const res = await fetch('/api/ratings', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + token,
				},
				body: JSON.stringify({ musicId, rating, title, albumTitle, coverUrl }),
			});

			if (res.ok) {
				const data = await res.json();
				if (data.existingRating) {
					toast(`Note modifiée : ${rating} étoiles`);
				} else {
					toast(`Note ajoutée : ${rating} étoiles`);
				}
				// Recharger les notes
				window.location.reload();
			} else {
				toast('Erreur lors de la notation');
			}
		} catch (error) {
			console.error('Error setting rating:', error);
			toast('Erreur lors de la notation');
		}
	};

	// Demander la suppression d'un favori
	const requestDelete = (item) => {
		setItemToDelete(item);
		setShowDeleteModal(true);
	};

	// Confirmer la suppression
	const confirmDelete = async () => {
		if (!itemToDelete) return;
		
		try {
			const token = localStorage.getItem('token');
			const res = await fetch(`/api/music/favorites/${itemToDelete.id}`, {
				method: 'DELETE',
				headers: { 'Authorization': 'Bearer ' + token }
			});

			if (res.ok) {
				toast('Favori supprimé !');
				// Recharger les favoris
				const token = localStorage.getItem('token');
				fetch('/api/music/favorites?page=1&pageSize=100', {
					headers: { 'Authorization': 'Bearer ' + token }
				})
					.then(res => res.json())
					.then(data => {
						if (data.items) {
							setFavorites(data.items);
						}
					});
			} else {
				toast('Erreur lors de la suppression');
			}
		} catch (error) {
			console.error('Error deleting favorite:', error);
			toast('Erreur lors de la suppression');
		}
		
		setShowDeleteModal(false);
		setItemToDelete(null);
	};

	const canLoadMore = items.length < total;

	return (
		<div style={{ minHeight: '100vh', background: '#18151c' }}>
			<Header />
			<main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px', color: '#fff' }}>
				<div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
					<button 
						onClick={() => navigate('/profile')}
						style={{
							background: 'transparent',
							color: '#ff9100',
							border: '1px solid #ff9100',
							borderRadius: 8,
							padding: '8px 16px',
							cursor: 'pointer',
							fontWeight: 600
						}}
					>
						← Retour au profil
					</button>
					<h1 style={{ margin: 0, color: '#ff9100' }}>Toutes mes notes</h1>
				</div>

				{loading && items.length === 0 && <p>Chargement…</p>}
				{error && <p style={{ color: '#ff3e3e' }}>{error}</p>}
				{items.length === 0 && !loading && !error && <p style={{ opacity: 0.8 }}>Aucune note pour le moment.</p>}

				{items.length > 0 && (
					<>
						<div style={{ display: 'flex', gap: 28, paddingBottom: 8, width: '100%', justifyContent: 'flex-start', flexWrap: 'wrap' }}>
							{items.map(r => (
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
													// Si c'est déjà un favori, le retirer
													const favoriteItem = favorites.find(fav => fav.musicId === musicId || fav.music?.mbid === musicId || fav.music?.id === musicId);
													if (favoriteItem) {
														requestDelete(favoriteItem);
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

						{canLoadMore && (
							<div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
								<button 
									onClick={() => setPage(p => p + 1)} 
									disabled={loading} 
									style={{ 
										background: '#ff9100', 
										border: 'none', 
										borderRadius: 8, 
										padding: '10px 16px', 
										fontWeight: 700, 
										cursor: 'pointer', 
										color: '#18151c' 
									}}
								>
									{loading ? 'Chargement…' : 'Afficher plus'}
								</button>
							</div>
						)}
					</>
				)}

				{/* Modal de confirmation de suppression */}
				{showDeleteModal && (
					<div style={{
						position: 'fixed',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						background: 'rgba(0,0,0,0.7)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						zIndex: 1000,
						backdropFilter: 'blur(4px)'
					}}>
						<div style={{
							background: '#18151c',
							border: '1px solid #333',
							borderRadius: 12,
							padding: '24px',
							maxWidth: '400px',
							width: '90%',
							textAlign: 'center'
						}}>
							<h3 style={{ margin: '0 0 16px 0', color: '#fff' }}>Confirmer la suppression</h3>
							<p style={{ margin: '0 0 24px 0', color: '#ccc' }}>
								Êtes-vous sûr de vouloir retirer cette musique de vos favoris ?
							</p>
							<div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
								<button
									onClick={() => setShowDeleteModal(false)}
									style={{
										background: '#333',
										color: '#fff',
										border: 'none',
										borderRadius: 8,
										padding: '10px 20px',
										cursor: 'pointer',
										fontWeight: 600
									}}
								>
									Annuler
								</button>
								<button
									onClick={confirmDelete}
									style={{
										background: '#ff3e3e',
										color: '#fff',
										border: 'none',
										borderRadius: 8,
										padding: '10px 20px',
										cursor: 'pointer',
										fontWeight: 600
									}}
								>
									Supprimer
								</button>
							</div>
						</div>
					</div>
				)}
			</main>
		</div>
	);
} 