const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// Proxy Deezer Track
router.get('/track/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const response = await fetch(`https://api.deezer.com/track/${id}`);
		const data = await response.json();
		res.json(data);
	} catch (error) {
		console.error('Deezer proxy track error:', error);
		res.status(500).json({ error: 'Erreur Deezer (track)' });
	}
});

// Proxy Deezer Album
router.get('/album/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const response = await fetch(`https://api.deezer.com/album/${id}`);
		const data = await response.json();
		res.json(data);
	} catch (error) {
		console.error('Deezer proxy album error:', error);
		res.status(500).json({ error: 'Erreur Deezer (album)' });
	}
});

module.exports = router; 