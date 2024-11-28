async function createGrid() {
    const cardGrid = document.querySelector('.card-grid');

    // Toda la información de las tarjetas está en un archivo json;
    try {
        const response = await fetch('./data/cards.json');
        const data = await response.json();

        // Creo las tarjetas del grid;
        data.cards.forEach(cardData => {
            const card = document.createElement('div');
            card.className = 'card-small rounded-medium';
            card.dataset.cardId = cardData.id;

            card.innerHTML = `
                <div class="card-number">#${cardData.id.toString().padStart(2, '0')}</div>
                <div class="card-hover">
                    <div class="bg-blur rounded-small"></div>
                    <div class="card-cover">
                        <div class="card-button border-black rounded-full big-cursor card-view-zoom">
                            <span class="glyph">↗</span>
                            <span>Ver tarjeta</span>
                        </div>
                        <div>
                            <p>#${cardData.id.toString().padStart(2, '0')}</p>
                            <h2>${cardData.title}</h2>
                        </div>
                    </div>
                </div>
                <figure>
                    <img src="${cardData.image}" alt="${cardData.title}">
                </figure>
                `;

            cardGrid.appendChild(card);
        });

        // Creo la animación del hover de las tajetas;
        const cards = document.querySelectorAll('.card-small');
        cards.forEach(card => {
            // Añado un indicador para controlar si el zoom está activo;
            card.dataset.zoomActive = 'false';
            card.addEventListener('mouseover', () => {
                // Se ejecuta si el zoom no está activo;
                if (card.dataset.zoomActive === 'false') {
                    card.querySelector('.card-number').style.opacity = '0';
                    card.querySelector('.card-number').style.visibility = 'hidden';
                    card.querySelector('.card-hover').style.opacity = '1';
                    card.querySelector('.card-hover').style.visibility = 'visible';
                    card.querySelector('.bg-blur').style.opacity = '1';
                    card.querySelector('.bg-blur').style.visibility = 'visible';
                }
            });

            card.addEventListener('mouseleave', () => {
                // Se ejecuta si el zoom no está activo;
                if (card.dataset.zoomActive === 'false') {
                    card.querySelector('.card-number').style.opacity = '1';
                    card.querySelector('.card-number').style.visibility = 'visible';
                    card.querySelector('.card-hover').style.opacity = '0';
                    card.querySelector('.card-hover').style.visibility = 'hidden';
                    card.querySelector('.bg-blur').style.opacity = '0';
                    card.querySelector('.bg-blur').style.visibility = 'hidden';
                }
            });
        });

    } catch (error) {
        console.error('Error al cargar los datos:', error);
    }
}