const express = require('express');
const app = express();
const jsonRoutes = require('./routes/json');

app.use(express.json());
app.use(express.static('public'));
app.use('/api/json', jsonRoutes);

app.listen(3000, () => {
    console.log('Serveur démarré sur http://localhost:3000');
});