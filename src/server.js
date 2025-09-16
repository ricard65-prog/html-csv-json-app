const express = require('express');
const fs = require('fs');
const app = express();
const jsonRoutes = require('./routes/json');

app.use(express.json());
app.use(express.static('public'));
app.use(express.static('pages'));
app.use(express.static('js'));
app.use(express.static('css'));
app.use(express.static('data'));
app.use('/api/json', jsonRoutes);



app.listen(3000, () => {
    console.log('Serveur démarré sur http://localhost:3000');
});