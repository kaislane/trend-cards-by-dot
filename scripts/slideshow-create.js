import { SLIDESHOW_CARD_WIDTH, SLIDESHOW_CARD_GAP } from './constants.js';
import { restoreGrid } from './card-view.js';
import { graphTemplates } from './graph-templates.js';
import { updateIndexHighlight } from './slideshow-move.js';

async function createSlideshow(selectedCard) {
    const cardSlideshow = document.querySelector('.card-slideshow');
    const gridContainer = document.querySelector('.grid-container');
    const slideshowContainer = document.querySelector('.slideshow-container');

    // Actualizo los números del id y del total de tarjetas;
    const cardIndexNumber = document.querySelector('.card-index-number');
    const cardTotalNumber = document.querySelector('.card-total-number');

    try {
        // Obtengo los datos del JSON;
        const response = await fetch('./data/cards.json');
        const data = await response.json();
        const cards = data.cards;

        // Actualizo los números antes de crear las tarjetas;
        cardTotalNumber.textContent = cards.length.toString();
        cardIndexNumber.textContent = '#' + selectedCard.dataset.cardId.padStart(2, '0');

        // Encuentro el índice de la tarjeta seleccionada;
        const selectedId = selectedCard.dataset.cardId;
        const currentIndex = cards.findIndex(card => card.id === selectedId);

        // Calculo los índices de las tarjetas adyacentes;
        const cardIndexes = [];
        for (let i = -2; i <= 2; i++) {
            let index = currentIndex + i;
            // Hago que el slideshow de tarjetas sea circular;
            if (index < 0) index = cards.length + index;
            if (index >= cards.length) index = index - cards.length;
            cardIndexes.push(index);
        }

        // Creo las 5 tarjetas del slideshow;
        cardIndexes.forEach((index, position) => {
            const cardData = cards[index];
            const card = createSingleCard(cardData, position);
            cardSlideshow.appendChild(card);
        });

        // Aplico los estilos iniciales de las tarjetas;
        const allCards = cardSlideshow.querySelectorAll('.card-big');
        allCards.forEach((card, index) => {
            const cardWidth = SLIDESHOW_CARD_WIDTH;
            const cardGap = SLIDESHOW_CARD_GAP;
            const offset = (index - 2) * (cardWidth + cardGap);

            // Al crear el slideshow la única tarjeta visible es la central;
            if (index === 2) {
                card.style.transform = `translateX(${offset}px) scale(1)`;
                card.style.opacity = '1';
            } else {
                card.style.transform = `translateX(${offset}px) scale(0.95)`;
                card.style.opacity = '0';
            }
        });

        cardSlideshow.offsetHeight;

        // Añado transiciones para las tarjetas laterales;
        setTimeout(() => {
            allCards.forEach(card => {
                card.style.transition = `
                    transform 1s ease-in-out,
                    opacity 1s ease-in-out,
                    scale 1s ease-in-out
                `;

                const position = parseInt(card.dataset.position);
                if (position !== 2) {
                    card.style.opacity = '0.5';
                }
            });
        }, 100);

        // Oculto el grid y muestro el slideshow;
        gridContainer.style.display = 'none';
        slideshowContainer.style.display = 'flex';

        // Event listener para cerrar el slideshow;
        const backButton = document.querySelector('.back-button');
        backButton.addEventListener('click', async () => {
            const isMobile = window.matchMedia('(max-width: 768px)').matches;

            // Primero hago el fade-out de las tarjetas laterales (tanto en móvil como en desktop)
            const allCards = cardSlideshow.querySelectorAll('.card-big');
            allCards.forEach(card => {
                const position = parseInt(card.dataset.position);
                if (position !== 2) {
                    card.style.transition = `
                        transform 1s ease-in-out,
                        opacity 1s ease-in-out,
                        scale 1s ease-in-out
                    `;
                    card.style.opacity = '0';
                }
            });

            if (isMobile) {
                await new Promise(resolve => setTimeout(resolve, 500));

                // Aplico fade out al contenedor del slideshow solo en móvil;
                slideshowContainer.style.transition = 'opacity 1s ease-in-out';
                slideshowContainer.style.opacity = '0';

                // Espero a que termine la animación;
                await new Promise(resolve => setTimeout(resolve, 1000));

            } else {
                // Oculto el elemento card-click-big si está visible;
                const centerCard = cardSlideshow.querySelector('[data-position="2"]');
                if (centerCard) {
                    const cardClickBig = centerCard.querySelector('.card-click-big');
                    if (cardClickBig && window.getComputedStyle(cardClickBig).opacity > '0') {
                        cardClickBig.style.transition = 'opacity 1s ease-in-out';
                        cardClickBig.style.opacity = '0';
                    }
                }

                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            // Limpio los números;
            cardIndexNumber.textContent = '#XX';
            cardTotalNumber.textContent = 'XX';

            // Oculto el slideshow;
            slideshowContainer.style.display = 'none';

            // Restauro el grid;
            await restoreGrid();

            // Limpio el slideshow después de que termine la transición;
            cardSlideshow.innerHTML = '';
        });

        // Después de crear las tarjetas, actualizo el índice
        const centerCard = cardSlideshow.querySelector('[data-position="2"]');
        if (centerCard) {
            updateIndexHighlight(centerCard.dataset.cardId);
        }

    } catch (error) {
        console.error('Error al cargar los datos:', error);
    }
}

// Función para crear una sola tarjeta;
export function createSingleCard(cardData, position) {
    const card = document.createElement('div');
    card.className = 'card-big rounded-big';
    card.id = cardData.id.toString().padStart(2, '0');
    card.dataset.cardId = cardData.id;
    card.dataset.position = position;

    card.innerHTML = `
        <figure>
            <img src="${cardData.image}" alt="${cardData.title}">
        </figure>
        <div class="card-hover-big">
            <div class="bg-blur-big rounded-medium"></div>
            <div class="card-cover-big">
                <div>
                    <p>#${cardData.id.toString().padStart(2, '0')}</p>
                    <h2>${cardData.title}</h2>
                </div>
            </div>
        </div>
        <div class="card-click-big">
            <div class="bg-blur-info-big rounded-medium"></div>
            <div class="card-info-big">
                <div class="close-button big-cursor">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M0 15.8L6.8 9.01L0 2.21L2.21 0L9.01 6.8L15.8 0L18 2.2L11.21 9.01L18 15.8L15.8 18L9.01 11.21L2.21 18L0 15.8Z"
                            fill="#1F1E1C" />
                    </svg>
                </div>
                <div class="card-title">
                    <p>#${cardData.id.toString().padStart(2, '0')}</p>
                    <h2>${cardData.title}</h2>
                </div>
                <div class="overflow-vertical">
                    <div class="two-columns card-text">
                        <p>${cardData.description}</p>
                        <div class="graph-container">
                            ${graphTemplates[cardData.graphType] || ''}
                        </div>
                    </div>
                    <div class="two-columns">
                        <div class="two-columns two-columns-mobile">
                            <div class="list-column">
                                <p>Industrias relevantes</p>
                                <ul>
                                    ${cardData.industries.map(industry => `<li>${industry}</li>`).join('')}
                                </ul>
                            </div>
                            <div class="list-column">
                                <p>Compañías trendsetter</p>
                                <ul>
                                    ${cardData.trendsetters.map(company => `<li>${company}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                        <div class="related-column">
                            <p>TENDENCIAS RELACIONADAS</p>
                            <ul>
                                ${cardData.related.map(trend => `
                                    <li class="related-index big-cursor card-view-show">
                                        <span class="glyph">#${trend.id}</span>
                                        <p>${trend.title}</p>
                                        <span class="glyph">↗</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Función para gestionar la visibilidad de los elementos interactivos;
    const setVisibility = (elements, visible) => {
        elements.forEach(el => {
            el.style.opacity = visible ? '1' : '0';
            el.style.visibility = visible ? 'visible' : 'hidden';
        });
    };

    const cardHover = card.querySelector('.card-hover-big');
    const cardClick = card.querySelector('.card-click-big');
    const bgBlur = card.querySelector('.bg-blur-big');

    // Oculto todos los elementos interactivos;
    if (window.matchMedia('(max-width: 768px)').matches) {
        // En móvil siempre muestro el elemento cardClick y oculto el cardHover;
        setVisibility([cardClick], true);
        setVisibility([cardHover, bgBlur], false);
    } else {
        // En desktop, inicialmente oculto todos los elementos;
        setVisibility([cardHover, cardClick, bgBlur], false);
    }

    // Solo añado event listeners de hover en desktop;
    if (!window.matchMedia('(max-width: 768px)').matches) {
        card.addEventListener('mouseover', () => {
            if (card.dataset.position === '2') {
                setVisibility([cardHover, bgBlur], true);
            }
        });

        card.addEventListener('mouseleave', () => {
            setVisibility([cardHover, bgBlur], false);
        });
    }

    // El click event solo lo necesito en desktop;
    if (!window.matchMedia('(max-width: 768px)').matches) {
        card.addEventListener('click', () => {
            if (card.dataset.position === '2') {
                setVisibility([cardHover], false);
                setVisibility([cardClick], true);
            }
        });
    }

    // El botón de cerrar y el fondo de la info solo los necesito en desktop;
    const closeButton = card.querySelector('.close-button');
    const bgBlurInfoBig = card.querySelector('.bg-blur-info-big');
    if (!window.matchMedia('(max-width: 768px)').matches) {
        closeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            setVisibility([cardClick], false);

            if (card.dataset.position === '2') {
                setVisibility([cardHover], true);
            }
        });
    } else {
        // En móvil, oculto el botón de cerrar y el fondo de la info;
        closeButton.style.display = 'none';
        bgBlurInfoBig.style.display = 'none';
    }

    return card;
}

// Exporto la función para usarla en card-view.js;
export { createSlideshow };