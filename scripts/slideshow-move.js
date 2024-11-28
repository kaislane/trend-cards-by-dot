import { SLIDESHOW_CARD_WIDTH, SLIDESHOW_CARD_GAP } from './constants.js';
import { createSingleCard } from './slideshow-create.js';

// Variable para controlar si el slideshow está en movimiento;
let isMoving = false;

// Función para verificar si el pop-up está visible;
function isPopupVisible() {
    const popup = document.querySelector('.card-popup');
    return popup && (
        popup.style.display === 'block' ||
        popup.style.display === 'flex' ||
        (window.getComputedStyle(popup).display !== 'none' &&
            window.getComputedStyle(popup).visibility !== 'hidden')
    );
}

const moveSlideshow = async (direction) => {
    // Si ya está en movimiento, no hago nada;
    if (isMoving) return;

    const cardSlideshow = document.querySelector('.card-slideshow');
    if (!cardSlideshow) return;

    // En movimiento;
    isMoving = true;

    try {
        // Oculto los elementos interactivos de la que deja de ser la tarjeta central;
        const currentCenterCard = cardSlideshow.querySelector('[data-position="2"]');
        if (currentCenterCard) {
            // En desktop oculto los elementos interactivos;
            if (!window.matchMedia('(max-width: 768px)').matches) {
                const cardClick = currentCenterCard.querySelector('.card-click-big');
                const cardHover = currentCenterCard.querySelector('.card-hover-big');
                const bgBlur = currentCenterCard.querySelector('.bg-blur-big');

                cardClick.style.opacity = '0';
                cardClick.style.visibility = 'hidden';
                cardHover.style.opacity = '0';
                cardHover.style.visibility = 'hidden';
                bgBlur.style.opacity = '0';
                bgBlur.style.visibility = 'hidden';
            }
        }

        // Obtengo todas las tarjetas actuales;
        const cards = Array.from(cardSlideshow.querySelectorAll('.card-big'));
        if (cards.length !== 5) return;

        const response = await fetch('./data/cards.json');
        const data = await response.json();
        const totalCards = data.cards.length;

        // Función auxiliar para gestionar el caso circular;
        const normalizeId = (id) => {
            while (id > totalCards) id -= totalCards;
            while (id < 1) id += totalCards;
            return id;
        };

        if (direction === 'right') {
            // Si el slideshow se mueve hacia la derecha (visualmente se mueve hacia la izquierda);
            // 1. Elimino la última tarjeta;
            cards[4].remove();

            // 2. Obtengo el ID de la primera tarjeta del slideshow de 5 tarjetas y calculo el ID anterior;
            const firstCardId = parseInt(cards[0].dataset.cardId);
            const newCardId = normalizeId(firstCardId - 1);

            // 3. Creo y añado la nueva tarjeta al principio;
            const cardData = data.cards.find(card => parseInt(card.id) === newCardId);
            const newCard = createSingleCard(cardData, '0');
            cardSlideshow.prepend(newCard);

        } else {
            // Si el slideshow se mueve hacia la izquierda (visualmente se mueve hacia la derecha);
            // 1. Elimino la primera tarjeta;
            cards[0].remove();

            // 2. Obtengo el ID de la última tarjeta del slideshow de 5 tarjetas y calculo el ID anterior;
            const lastCardId = parseInt(cards[4].dataset.cardId);
            const newCardId = normalizeId(lastCardId + 1);

            // 3. Creo y añado la nueva tarjeta al final;
            const cardData = data.cards.find(card => parseInt(card.id) === newCardId);
            const newCard = createSingleCard(cardData, '4');
            cardSlideshow.append(newCard);
        }

        // Actualizo las posiciones;
        const allCards = cardSlideshow.querySelectorAll('.card-big');
        allCards.forEach((card, index) => {
            card.dataset.position = index.toString();
            const cardWidth = SLIDESHOW_CARD_WIDTH;
            const cardGap = SLIDESHOW_CARD_GAP;
            const offset = (index - 2) * (cardWidth + cardGap);

            // Aplico las transiciones;
            card.style.transition = `
                transform 1s ease-in-out,
                opacity 1s ease-in-out,
                scale 1s ease-in-out
            `;

            // Aplico los estilos según la posición;
            if (index === 2) {
                // Tarjeta central;
                card.style.transform = `translateX(${offset}px) scale(1)`;
                card.style.opacity = '1';
            } else {
                // Tarjetas laterales;
                card.style.transform = `translateX(${offset}px) scale(0.95)`;
                card.style.opacity = '0.5';
            }
        });

        // Actualizo el número de tarjeta que se muestra en la parte inferior;
        const cardIndexNumber = document.querySelector('.card-index-number');
        if (cardIndexNumber) {
            const newCenterCard = document.querySelector('[data-position="2"]');
            if (newCenterCard) {
                const newCenterId = newCenterCard.dataset.cardId;
                cardIndexNumber.textContent = '#' + newCenterId.toString().padStart(2, '0');
            }
        }

        // Después de actualizar las posiciones;
        const newCenterCard = document.querySelector('[data-position="2"]');
        if (newCenterCard) {
            const newCenterId = newCenterCard.dataset.cardId;
            updateIndexHighlight(newCenterId);
        }

        // Espero a que termine la transición antes de permitir otro movimiento;
        setTimeout(() => {
            isMoving = false;
        }, 1000); // Duración de la transición;

    } catch (error) {
        console.error('Error al actualizar el slideshow:', error);
        isMoving = false; // Me aseguro de resetear el estado en caso de error;
    }
};

// Función para destacar la tarjeta seleccionada en el índice;
export function updateIndexHighlight(cardId) {
    // Primero elimino la clase de todos los elementos;
    document.querySelectorAll('.index-menu li').forEach(item => {
        item.classList.remove('text-bold');
    });

    // Añado la clase al elemento correspondiente;
    const indexItem = document.querySelector(`.index-menu li:nth-child(${cardId})`);
    if (indexItem) {
        indexItem.classList.add('text-bold');
    }
}

// Event listeners;
document.addEventListener('DOMContentLoaded', () => {
    // Verifico que el slideshow existe antes de añadir los listeners;
    const slideshowContainer = document.querySelector('.slideshow-container');
    if (!slideshowContainer) return;

    // Movimiento con teclado;
    document.addEventListener('keydown', (event) => {
        if (isPopupVisible() || slideshowContainer.style.display !== 'flex') return;

        const movements = {
            'ArrowRight': 'left',
            'd': 'left',
            'ArrowLeft': 'right',
            'a': 'right'
        };

        if (movements[event.key]) {
            moveSlideshow(movements[event.key]);
        }
    });

    // Movimiento con scroll;
    document.addEventListener('wheel', (event) => {
        const popup = document.querySelector('.card-popup');

        // Si el pop-up está visible y el evento ocurre dentro de él,
        // permito el scroll normal del contenido del pop-up;
        if (isPopupVisible() && popup.contains(event.target)) {
            return;
        }

        // Si el pop-up está visible y el evento no está dentro de él,
        // no se hace scroll;
        if (isPopupVisible()) {
            event.preventDefault();
            return;
        }

        // Verifico si el slideshow está visible;
        const slideshowContainer = document.querySelector('.slideshow-container');
        if (slideshowContainer.style.display !== 'flex') return;

        // Verifico si el evento ocurre dentro del index-menu;
        const indexMenu = document.querySelector('.index-menu');
        if (indexMenu && indexMenu.contains(event.target)) {
            // Si el cursor está en el menú, permito el scroll normal;
            return;
        }

        event.preventDefault();
        // Invierto la dirección del scroll;
        const direction = event.deltaY > 0 ? 'left' : 'right';
        moveSlideshow(direction);
    }, { passive: false });

    // MOVIMIENTO EN PANTALLAS TÁCTILES //

    let touchStartX = 0;
    let touchStartY = 0;
    const touchThreshold = 50;

    // Inicio del touch;
    slideshowContainer.addEventListener('touchstart', (event) => {
        if (isPopupVisible()) return;
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
    });

    // Fin del touch;
    slideshowContainer.addEventListener('touchend', (event) => {
        if (isPopupVisible()) return;
        const touchEndX = event.changedTouches[0].clientX;
        const touchEndY = event.changedTouches[0].clientY;
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;

        // Solo muevo el slideshow si el swipe es más horizontal que vertical;
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > touchThreshold) {
            const direction = deltaX > 0 ? 'right' : 'left';
            moveSlideshow(direction);
        }
    });

    slideshowContainer.addEventListener('touchmove', (event) => {
        const popup = document.querySelector('.card-popup');

        // Permito el scroll normal dentro del pop-up;
        if (popup && popup.contains(event.target)) {
            return;
        }

        const touch = event.touches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;

        // Verifico si el touch está dentro de overflow-vertical;
        const overflowElement = event.target.closest('.overflow-vertical');

        if (overflowElement) {
            // Permito el scroll vertical dentro de overflow-vertical;
            if (Math.abs(deltaY) > Math.abs(deltaX)) {
                // Si es movimiento más vertical que horizontal;
                event.stopPropagation();
                return; // Permito el comportamiento normal del scroll;
            }
        }

        // Si el movimiento es más horizontal, muevo el slideshow;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            event.preventDefault();
        }
    }, { passive: false });
});
