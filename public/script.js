
document.getElementById('addJsonForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nom = document.getElementById('jsonNom').value;
    const age = document.getElementById('jsonAge').value;
    try {
        // Lire le JSON existant
        const res = await fetch('/api/json');
        let data = await res.json();
        if (!Array.isArray(data)) data = [];
        // Ajouter la nouvelle ligne
        data.push({ nom, age });
        // Réécrire le JSON
        const writeRes = await fetch('/api/json', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await writeRes.json();
        alert(result.message || 'Ligne ajoutée au JSON');
    } catch (err){
        alert('Erreur lors de l\'ajout au JSON');
    }
});

document.getElementById('showJsonBtn').addEventListener('click', async () => {
    const list = document.getElementById('jsonList');
    list.innerHTML = 'Chargement...';
    try {
        const res = await fetch('/api/json');
        const data = await res.json();
        list.innerHTML = '';
        if (Array.isArray(data)) {
            data.forEach(item => {
                const li = document.createElement('li');
                li.textContent = `Nom: ${item.nom}, Âge: ${item.age}`;
                list.appendChild(li);
            });
        } else {
            list.innerHTML = 'Aucune donnée à afficher.';
        }
    } catch {
        list.innerHTML = 'Erreur lors de la lecture du JSON.';
    }
});
