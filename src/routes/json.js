const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const jsonFilePath = path.join(__dirname, '../../data/data.json');

router.get('/', (req, res) => {
    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: err.message });
        try {
            const jsonData = JSON.parse(data || '[]');
            res.json(jsonData);
        } catch (parseErr) {
            res.status(500).json({ error: 'Erreur de parsing du JSON.' });
        }
    });
});

router.post('/', (req, res) => {
    const obj = req.body;
    fs.writeFile(jsonFilePath, JSON.stringify(obj, null, 2), (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'JSON mis à jour avec succès.' });
    });
});


module.exports = router;