// Función para crear el menú de índice
function createIndexMenu() {
    // Obtengo el contenedor donde se insertará el menú;
    const container = document.querySelector('nav.index-menu ul');

    // Cargo el archivo JSON;
    fetch('./data/cards.json')
        .then(response => response.json())
        .then(data => {
            // Creo elementos del menú para cada tarjeta;
            data.cards.forEach(card => {
                const li = document.createElement('li');
                li.classList.add('big-cursor', 'card-view-show');
                li.innerHTML = `
                    <span class="glyph">#${card.id}</span>
                    <p>${card.title}</p>
                    <span class="glyph">↗</span>
                `;
                container.appendChild(li);
            });
        })
        .catch(error => console.error('Error cargando las tarjetas:', error));
}

// DESPLIEGUE DEL ÍNDICE;

document.addEventListener('DOMContentLoaded', () => {
    createIndexMenu();

    // Añado la funcionalidad para desplegar/replegar el índice;
    const deployButton = document.getElementById('index-deploy');
    const indexMenu = document.querySelector('.index-menu');

    deployButton.addEventListener('click', () => {
        indexMenu.classList.toggle('deployed');

        // Cambio el texto del botón según el estado;
        if (indexMenu.classList.contains('deployed')) {
            deployButton.textContent = 'CERRAR';
        } else {
            deployButton.textContent = 'ÍNDICE';
        }
    });
});