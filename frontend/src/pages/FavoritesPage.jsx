import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { toast } from 'react-toastify';

export default function FavoritesPage() {
	const [items, setItems] = useState([]);
	const [page, setPage] = useState(1);
	const [pageSize] = useState(12);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [pendingDeleteId, setPendingDeleteId] = useState(null);
	const fetchedPages = useRef(new Set());
	const navigate = useNavigate();

	// Fonction pour supprimer un favori
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
				setItems(prev => prev.filter(item => item.id !== id));
				setTotal(prev => Math.max(0, prev - 1));
			} else {
				toast.error('Erreur lors de la suppression');
			}
		} catch (error) {
			console.error('Error removing from favorites:', error);
			toast.error('Erreur lors de la suppression');
		}
	};

	// Fonction pour noter une musique
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
				toast.success(`Note ${rating}/5 enregistrée !`);
			} else {
				toast.error('Erreur lors de l\'enregistrement de la note');
			}
		} catch (error) {
			console.error('Error setting rating:', error);
			toast.error('Erreur lors de l\'enregistrement de la note');
		}
	};

	// Fonctions pour le popup de confirmation
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
		await removeFromFavorites(pendingDeleteId);
		setConfirmOpen(false);
		setPendingDeleteId(null);
	};

	useEffect(() => {
		const token = localStorage.getItem('token');
		if (!token) return;
		if (fetchedPages.current.has(page)) return;
		setLoading(true);
		setError('');
		fetch(`/api/music/favorites?page=${page}&pageSize=${pageSize}`, {
			headers: { 'Authorization': 'Bearer ' + token }
		})
			.then(res => { if (res.ok) return res.json(); throw new Error('Failed to fetch favorites'); })
			.then(data => {
				setItems(prev => {
					const existing = new Set(prev.map(i => i.id));
					const merged = [...prev, ...(data.items || []).filter(i => !existing.has(i.id))];
					return merged;
				});
				setTotal(data.total || 0);
				fetchedPages.current.add(page);
			})
			.catch(err => setError(err.message || 'Error'))
			.finally(() => setLoading(false));
	}, [page, pageSize]);

	const canLoadMore = items.length < total;

	// Vérifier si une musique est dans les favoris
	const isInFavorites = (musicId, title, artist) => {
		return items.some(fav => {
			// Comparer par titre et artiste (plus stable que les IDs)
			const titleMatch = fav.title === title || fav.music?.title === title;
			const artistMatch = fav.albumTitle === artist || fav.music?.album?.title === artist;
			return titleMatch && artistMatch;
		});
	};

	return (
		<div style={{ minHeight: '100vh', background: '#18151c' }}>
			<Header />
			
			{/* Modal de confirmation */}
			{confirmOpen && (
				<div style={{
					position: 'fixed', inset: 0, zIndex: 9998,
					background: 'rgba(0,0,0,0.35)',
					backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)'
				}}>
					<div style={{
						position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
						background: '#000',
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

			<main style={{ maxWidth: 1024, margin: '0 auto', padding: '24px 16px', color: '#fff' }}>
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
					<h1 style={{ margin: 0, color: '#ff9100' }}>Mes favoris</h1>
				</div>
				{loading && items.length === 0 && <p>Chargement…</p>}
				{error && <p style={{ color: '#ff3e3e' }}>{error}</p>}
				{items.length === 0 && !loading && !error && <p style={{ opacity: 0.8 }}>Aucun favori pour le moment.</p>}
				{items.length > 0 && (
					<>
						<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 24, width: '100%' }}>
							{/* Cartes des favoris avec étoiles intégrées */}
							<div style={{ display: 'flex', gap: 28, paddingBottom: 8, width: '100%', justifyContent: 'flex-start', flexWrap: 'wrap' }}>
								{items.map(item => (
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
															setRating(item.musicId || item.music?.mbid || item.music?.id, star, item.title, item.albumTitle, item.coverUrl);
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
						</div>
						{canLoadMore && (
							<div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
								<button onClick={() => setPage(p => p + 1)} disabled={loading} style={{ background: '#ff9100', border: 'none', borderRadius: 8, padding: '10px 16px', fontWeight: 700, cursor: 'pointer', color: '#18151c' }}>
									{loading ? 'Chargement…' : 'Afficher plus'}
								</button>
							</div>
						)}
					</>
				)}
			</main>
		</div>
	);
} 