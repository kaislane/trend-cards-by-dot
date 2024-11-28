import { CARD_WIDTH, CARD_HEIGHT, CARD_GAP, GRID_COLUMNS, GRID_ROWS } from './constants.js';
import { isAnimating } from './card-view.js';

let currentX = 0;
let currentY = 0;

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

// Función para actualizar la opacidad y escala de las tarjetas;
export function updateCardsOpacity() {
    const cards = document.querySelectorAll('.card-small');
    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight / 2;

    let closestCard = null;
    let minDistance = Infinity;

    // Calculo la distancia de cada tarjeta al centro de la ventana;
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const cardCenterX = rect.left + (rect.width / 2);
        const cardCenterY = rect.top + (rect.height / 2);

        const distance = Math.sqrt(
            Math.pow(cardCenterX - viewportCenterX, 2) +
            Math.pow(cardCenterY - viewportCenterY, 2)
        );

        if (distance < minDistance) {
            minDistance = distance;
            closestCard = card;
        }
    });

    // Actualizo la opacidad y escala de cada tarjeta según su distancia al centro con un margen de error de 50px;
    cards.forEach(card => {
        card.style.transition = 'opacity 0.5s ease-in-out, scale 0.5s ease-in-out';
        if (card === closestCard && minDistance < 50) {
            card.style.opacity = '1';
            card.style.scale = '1.05';

            // Actualizo el índice;
            const cardId = card.dataset.cardId;
            updateIndexHighlight(cardId);
        } else {
            card.style.opacity = '0.5';
            card.style.scale = '1';
        }
    });
}

// Función para destacar la tarjeta seleccionada en el índice;
function updateIndexHighlight(cardId) {
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

document.addEventListener('DOMContentLoaded', async () => {
    const cardGrid = document.querySelector('.card-grid');
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;

    // La posición inicial es la de la tarjeta #01;
    currentX = (windowWidth - CARD_WIDTH) / 2;
    currentY = (windowHeight - CARD_HEIGHT) / 2;

    // Aplico la posición inicial;
    cardGrid.style.transform = `translate(${currentX}px, ${currentY}px)`;

    // Espero a que se creen las tarjetas antes de continuar;
    await createGrid();

    // Actualizo la opacidad inicial después de crear las tarjetas;
    updateCardsOpacity();

    // Función para calcular los límites del grid;
    const calculateGridLimits = () => {
        const totalWidth = GRID_COLUMNS * (CARD_WIDTH + CARD_GAP) - CARD_GAP;
        const totalHeight = GRID_ROWS * (CARD_HEIGHT + CARD_GAP) - CARD_GAP;

        const minX = windowWidth - totalWidth - (windowWidth - CARD_WIDTH) / 2;
        const maxX = (windowWidth - CARD_WIDTH) / 2;
        const minY = windowHeight - totalHeight - (windowHeight - CARD_HEIGHT) / 2;
        const maxY = (windowHeight - CARD_HEIGHT) / 2;

        return { minX, maxX, minY, maxY };
    };

    // Función unificada para mover el grid;
    const moveGrid = (deltaX, deltaY) => {
        if (isAnimating) return; // Si hay una animación en curso, no se mueve;

        const limits = calculateGridLimits();
        let newX = Math.min(limits.maxX, Math.max(limits.minX, currentX + deltaX));
        let newY = Math.min(limits.maxY, Math.max(limits.minY, currentY + deltaY));

        // Verifico si se intenta superar un límite del grid;
        const passLimitX = (currentX + deltaX) < limits.minX || (currentX + deltaX) > limits.maxX;
        const passLimitY = (currentY + deltaY) < limits.minY || (currentY + deltaY) > limits.maxY;

        if (passLimitX || passLimitY) {
            // Animación de rebote cuando se intenta superar el límite;
            const bounceDistance = -20;
            const bounceX = passLimitX ? (deltaX > 0 ? -bounceDistance : bounceDistance) : 0;
            const bounceY = passLimitY ? (deltaY > 0 ? -bounceDistance : bounceDistance) : 0;

            // Aplico rebote desde la posición actual;
            cardGrid.style.transform = `translate(${currentX + bounceX}px, ${currentY + bounceY}px)`;
            cardGrid.style.transition = 'transform 0.2s ease-out';

            // Volver a la posición actual;
            setTimeout(() => {
                cardGrid.style.transform = `translate(${currentX}px, ${currentY}px)`;
                cardGrid.style.transition = 'transform 0.2s ease-in';
            }, 200);

        } else if (newX !== currentX || newY !== currentY) {
            // Movimiento normal dentro de los límites del grid;
            currentX = newX;
            currentY = newY;
            cardGrid.style.transform = `translate(${currentX}px, ${currentY}px)`;
            cardGrid.style.transition = 'transform 0.5s ease-in-out';
            setTimeout(updateCardsOpacity, 500);
        }
    };

    // CONTROL CON TECLADO //

    // Event listener para teclado;
    document.addEventListener('keydown', (event) => {
        if (isPopupVisible()) return; // No permito el movimiento si el pop-up está visible;

        const moveDistance = {
            x: CARD_WIDTH + CARD_GAP,
            y: CARD_HEIGHT + CARD_GAP
        };

        const movements = {
            'ArrowRight': [-moveDistance.x, 0],
            'd': [-moveDistance.x, 0],
            'ArrowLeft': [moveDistance.x, 0],
            'a': [moveDistance.x, 0],
            'ArrowDown': [0, -moveDistance.y],
            's': [0, -moveDistance.y],
            'ArrowUp': [0, moveDistance.y],
            'w': [0, moveDistance.y]
        };

        if (movements[event.key]) {
            const [deltaX, deltaY] = movements[event.key];
            moveGrid(deltaX, deltaY);
        }
    });

    // CONTROL CON SCROLL (RATÓN) //

    // Añado variables para controlar el scroll;
    let lastScrollTime = 0;
    const scrollThreshold = 200;

    // Event listener para scroll;
    document.addEventListener('wheel', (event) => {

        const indexMenu = document.querySelector('.index-menu');
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

        // Verifico si el evento ocurre dentro del index-menu;
        if (indexMenu && indexMenu.contains(event.target)) {
            // Si el cursor está en el menú, permito el scroll normal;
            return;
        }

        // Control de tiempo entre scrolls;
        const currentTime = Date.now();
        if (currentTime - lastScrollTime < scrollThreshold) {
            event.preventDefault();
            return;
        }
        lastScrollTime = currentTime;

        // Si el cursor no está en el menú, el scroll mueve el grid;
        event.preventDefault();

        const moveDistance = event.shiftKey ?
            [event.deltaY > 0 ? -(CARD_WIDTH + CARD_GAP) : (CARD_WIDTH + CARD_GAP), 0] :
            [0, event.deltaY > 0 ? -(CARD_HEIGHT + CARD_GAP) : (CARD_HEIGHT + CARD_GAP)];

        moveGrid(...moveDistance);
    }, { passive: false });

    // CONTROL CON TRACKPAD (MAC) //

    // Lo dejo para una versión posterior. Me he peleado bastante con esta parte,
    // pero ni siquiera he conseguido dar con el event listener correcto para el trackpad de Mac.

    // CONTROL EN PANTALLAS TÁCTILES //

    // Añado variables para el control táctil;
    let touchStartX = 0;
    let touchStartY = 0;
    const touchThreshold = 50; // Umbral mínimo para detectar un swipe;

    // Event listeners para el touch;
    document.addEventListener('touchstart', (event) => {
        if (isPopupVisible()) return;
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
    });

    document.addEventListener('touchend', (event) => {
        if (isPopupVisible()) return;
        const touchEndX = event.changedTouches[0].clientX;
        const touchEndY = event.changedTouches[0].clientY;

        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;

        // Verifico si el evento ocurre dentro del index-menu;
        const indexMenu = document.querySelector('.index-menu');
        if (indexMenu && indexMenu.contains(event.target)) {
            return;
        }

        // Determino la dirección del swipe;
        if (Math.abs(deltaX) > touchThreshold || Math.abs(deltaY) > touchThreshold) {
            // Calculo si el movimiento es más horizontal o vertical;
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Movimiento horizontal;
                moveGrid(
                    deltaX > 0 ? (CARD_WIDTH + CARD_GAP) : -(CARD_WIDTH + CARD_GAP),
                    0
                );
            } else {
                // Movimiento vertical;
                moveGrid(
                    0,
                    deltaY > 0 ? (CARD_HEIGHT + CARD_GAP) : -(CARD_HEIGHT + CARD_GAP)
                );
            }
        }
    });

    // Evito el scroll por defecto en pantallas táctiles;
    document.addEventListener('touchmove', (event) => {
        const indexMenu = document.querySelector('.index-menu');
        const popup = document.querySelector('.card-popup');

        // Permito el scroll normal dentro del pop-up;
        if (popup && popup.contains(event.target)) {
            return;
        }

        if (!indexMenu || !indexMenu.contains(event.target)) {
            event.preventDefault();
        }
    }, { passive: false });

    // Función para calcular y actualizar la posición central al cambiar el tamaño de la ventana;
    const updateGridPosition = () => {
        const newWindowWidth = window.innerWidth;
        const newWindowHeight = window.innerHeight;

        const deltaX = (newWindowWidth - windowWidth) / 2;
        const deltaY = (newWindowHeight - windowHeight) / 2;

        currentX += deltaX;
        currentY += deltaY;

        cardGrid.style.transform = `translate(${currentX}px, ${currentY}px)`;
        cardGrid.style.transition = 'none';

        // Actualizo las variables globales;
        windowWidth = newWindowWidth;
        windowHeight = newWindowHeight;

        // setTimeout para asegurar que el DOM se ha actualizado;
        setTimeout(() => {
            updateCardsOpacity();
            cardGrid.style.transition = 'transform 0.5s ease-in-out';
        }, 100);
    };

    // Agrego un event listener para el cambio de tamaño de ventana;
    window.addEventListener('resize', () => {
        updateGridPosition();
    });

});

export function updateGridPosition(newX, newY) {
    const cardGrid = document.querySelector('.card-grid');
    currentX = newX;
    currentY = newY;

    if (cardGrid) {
        cardGrid.style.transform = `translate(${currentX}px, ${currentY}px)`;
    }
}