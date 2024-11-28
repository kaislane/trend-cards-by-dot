import { createSlideshow } from './slideshow-create.js';
import { updateCardsOpacity, updateGridPosition } from './grid-move.js';
import { applyDarkMode, applyLightMode } from './display-modes.js';

// Añado una variable para controlar el estado de la animación;
let isAnimating = false;

// Función para centrar la tarjeta seleccionada;
function centerCard(selectedCard) {
    const cardGrid = document.querySelector('.card-grid');
    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight / 2;
    const rect = selectedCard.getBoundingClientRect();
    const cardCenterX = rect.left + (rect.width / 2);
    const cardCenterY = rect.top + (rect.height / 2);

    // Calculo la distancia del centro de la tarjeta al centro de la ventana;
    const deltaX = viewportCenterX - cardCenterX;
    const deltaY = viewportCenterY - cardCenterY;

    // Obtengo la posición actual del grid;
    const currentTransform = window.getComputedStyle(cardGrid).transform;
    const matrix = new DOMMatrix(currentTransform);
    const currentX = matrix.m41;
    const currentY = matrix.m42;

    // Calculo la nueva posición;
    const newX = currentX + deltaX;
    const newY = currentY + deltaY;

    // Verifico si la tarjeta ya está centrada (con un margen de error de 50px);
    const isCentered = Math.abs(deltaX) < 50 && Math.abs(deltaY) < 50;

    return new Promise(async (resolve) => {
        if (isCentered) {
            // Si ya está centrada, aplico los cambios de opacidad y escala inmediatamente;
            const cards = document.querySelectorAll('.card-small');
            cards.forEach(card => {
                card.style.transition = 'opacity 0.5s ease-in-out, scale 0.5s ease-in-out';
                card.style.opacity = card === selectedCard ? '1' : '0.5';
                card.style.scale = card === selectedCard ? '1.05' : '1';
            });
            resolve();
        } else {
            // Si no está centrada, primero la centro;
            cardGrid.style.transition = 'transform 0.5s ease-in-out';
            cardGrid.style.transform = `translate(${newX}px, ${newY}px)`;

            // Espero a que termine el movimiento;
            await new Promise(r => setTimeout(r, 500));

            // Luego aplico los cambios de opacidad y escala;
            const cards = document.querySelectorAll('.card-small');
            cards.forEach(card => {
                card.style.transition = 'opacity 0.5s ease-in-out, scale 0.5s ease-in-out';
                card.style.opacity = card === selectedCard ? '1' : '0.5';
                card.style.scale = card === selectedCard ? '1.05' : '1';
            });

            await new Promise(r => setTimeout(r, 500));
            resolve();
        }
    });
}

// Función para ocultar todas las tarjetas excepto la seleccionada;
function hideOtherCards(selectedCard) {
    const cards = document.querySelectorAll('.card-small');
    return new Promise(resolve => {
        cards.forEach(card => {
            if (card !== selectedCard) {
                card.style.transition = 'opacity 0.5s ease-in-out';
                card.style.opacity = '0';
            }
        });

        // Espero a que termine la última transición;
        setTimeout(resolve, 0); // Las tarjetas se ocultan al mismo tiempo que se aplica el modo oscuro;
    });
}

// FUNCIÓN PARA VOLVER A LA VISTA DE GRID //

// Función para restaurar el grid;
async function restoreGrid() {
    isAnimating = true; // Desactivo el movimiento;
    const gridContainer = document.querySelector('.grid-container');
    const cardGrid = document.querySelector('.card-grid');
    const cards = document.querySelectorAll('.card-small');
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    // Obtengo la última tarjeta vista;
    const lastViewedCardId = document.querySelector('.card-big[data-position="2"]').dataset.cardId;
    const selectedCard = document.querySelector(`.card-small[data-card-id="${lastViewedCardId}"]`);

    selectedCard.dataset.zoomActive = 'true';

    if (selectedCard) {
        // Posiciono el grid sin que el usuario lo vea;
        gridContainer.style.display = 'grid';
        gridContainer.style.opacity = '0';

        // Mantengo ocultos los elementos de la tarjeta;
        const cardNumber = selectedCard.querySelector('.card-number');
        const cardHover = selectedCard.querySelector('.card-hover');
        const bgBlur = selectedCard.querySelector('.bg-blur');

        cardNumber.style.opacity = '0';
        cardNumber.style.visibility = 'hidden';
        cardHover.style.opacity = '0';
        cardHover.style.visibility = 'hidden';
        bgBlur.style.opacity = '0';
        bgBlur.style.visibility = 'hidden';

        // Desactivo temporalmente todas las transiciones;
        cardGrid.style.transition = 'none';
        selectedCard.style.transition = 'none';
        cards.forEach(card => card.style.transition = 'none');

        // Configuro las opacidades y escalas iniciales;
        if (isMobile) {
            selectedCard.style.scale = '1.05';
        } else {
            selectedCard.style.scale = '2';
        }

        selectedCard.style.opacity = '1';
        cards.forEach(card => {
            if (card !== selectedCard) {
                card.style.opacity = '0';
                card.style.scale = '1';
            }
        });

        // Centro la tarjeta seleccionada;
        const viewportCenterX = window.innerWidth / 2;
        const viewportCenterY = window.innerHeight / 2;
        const rect = selectedCard.getBoundingClientRect();
        const cardCenterX = rect.left + (rect.width / 2);
        const cardCenterY = rect.top + (rect.height / 2);

        const deltaX = viewportCenterX - cardCenterX;
        const deltaY = viewportCenterY - cardCenterY;

        const currentTransform = window.getComputedStyle(cardGrid).transform;
        const matrix = new DOMMatrix(currentTransform);
        const currentX = matrix.m41;
        const currentY = matrix.m42;

        const newX = currentX + deltaX;
        const newY = currentY + deltaY;

        // Actualizo la posición global del grid;
        updateGridPosition(newX, newY);

        // Aplico la nueva posición sin transición;
        cardGrid.style.transform = `translate(${newX}px, ${newY}px)`;
        cardGrid.offsetHeight;

        // Muestro el grid y restauro las transiciones;
        gridContainer.style.opacity = '1';
        cardGrid.style.transition = 'transform 0.5s ease-in-out';
        selectedCard.style.transition = 'scale 1s ease-in-out';

        cards.forEach(card => {
            if (card !== selectedCard) {
                card.style.transition = 'opacity 0.5s ease-in-out, scale 0.5s ease-in-out';
            }
        });

        if (isMobile) {
            // Espero a que termine la transición;
            await new Promise(resolve => setTimeout(resolve, 500));

        } else {
            // Versión desktop: aplico el zoom out;
            selectedCard.style.scale = '1.05';
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Muestro el resto de tarjetas;
        cards.forEach(card => {
            if (card !== selectedCard) {
                card.style.transition = 'opacity 0.5s ease-in-out';
                card.style.opacity = '0.5';
            }
        });

        // Restauro el modo claro;
        applyLightMode();

        // Actualizo la opacidad final;
        updateCardsOpacity();

        // Restauro los elementos visuales de todas las tarjetas;
        cards.forEach(card => {

            // Reseteo el estado de zoom para todas las tarjetas;
            card.dataset.zoomActive = 'false';

            const cardNumber = card.querySelector('.card-number');
            const cardHover = card.querySelector('.card-hover');
            const bgBlur = card.querySelector('.bg-blur');

            if (cardNumber && cardHover && bgBlur) {
                // Restauro las transiciones;
                cardNumber.style.transition = 'opacity .5s ease-in-out, visibility .5s ease-in-out';
                cardHover.style.transition = 'opacity .5s ease-in-out, visibility .5s ease-in-out';
                bgBlur.style.transition = 'opacity .5s ease-in-out, visibility .5s ease-in-out';

                // Restauro el estado inicial del hover;
                cardNumber.style.opacity = '1';
                cardNumber.style.visibility = 'visible';
                cardHover.style.opacity = '0';
                cardHover.style.visibility = 'hidden';
                bgBlur.style.opacity = '0';
                bgBlur.style.visibility = 'hidden';
            }
        });
    }

    isAnimating = false; // Reactivo el movimiento;
}

// Función para hacer fade out del slideshow actual;
async function fadeOutSlideshow() {
    const cardSlideshow = document.querySelector('.card-slideshow');

    // Aplico fade out al contenedor completo;
    cardSlideshow.style.transition = 'opacity 1s ease-in-out';
    cardSlideshow.style.opacity = '0';

    // Espero a que termine la animación;
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Limpio el contenido del slideshow;
    cardSlideshow.innerHTML = '';
}

// Función para hacer fade in del nuevo slideshow;
async function fadeInSlideshow() {
    const cardSlideshow = document.querySelector('.card-slideshow');

    // Inicialmente el slideshow no está visible;
    cardSlideshow.style.transition = 'none';
    cardSlideshow.style.opacity = '0';

    cardSlideshow.offsetHeight;

    // Aplico el fade in al contenedor completo;
    cardSlideshow.style.transition = 'opacity 1s ease-in-out';
    cardSlideshow.style.opacity = '1';

    // Espero a que termine la animación;
    await new Promise(resolve => setTimeout(resolve, 1000));
}

// ANIMACIONES AL PULSAR "VER TARJETA" //

// Añado un event listener para el botón "Ver tarjeta";
document.addEventListener('click', async function (event) {
    const zoomButton = event.target.closest('.card-view-zoom');
    if (zoomButton) {
        isAnimating = true; // Desactivo el movimiento;
        const selectedCard = zoomButton.closest('.card-small');
        const isMobile = window.matchMedia('(max-width: 768px)').matches;

        // Activo el modo zoom;
        selectedCard.dataset.zoomActive = 'true';

        // 1. Oculto los elementos de la tarjeta;
        const cardNumber = selectedCard.querySelector('.card-number');
        const cardHover = selectedCard.querySelector('.card-hover');
        const bgBlur = selectedCard.querySelector('.bg-blur');

        cardNumber.style.transition = 'opacity .5s ease-in-out, visibility .5s ease-in-out';
        cardHover.style.transition = 'opacity .5s ease-in-out, visibility .5s ease-in-out';
        bgBlur.style.transition = 'opacity .5s ease-in-out, visibility .5s ease-in-out';

        cardNumber.style.opacity = '0';
        cardNumber.style.visibility = 'hidden';
        cardHover.style.opacity = '0';
        cardHover.style.visibility = 'hidden';
        bgBlur.style.opacity = '0';
        bgBlur.style.visibility = 'hidden';

        // Espero a que termine la transición que oculta las tarjetas;
        await new Promise(resolve => setTimeout(resolve, 500));

        // 2. Centro la tarjeta;
        await centerCard(selectedCard);

        // 3. Oculto el resto de tarjetas;
        await hideOtherCards(selectedCard);

        // 4. Aplico el modo oscuro;
        applyDarkMode();

        if (isMobile) {
            // En móvil: fade out del grid y creación del slideshow;
            const gridContainer = document.querySelector('.grid-container');
            const slideshowContainer = document.querySelector('.slideshow-container');

            // Fade out del grid;
            await new Promise(resolve => setTimeout(resolve, 500));
            gridContainer.style.transition = 'opacity 1s ease-in-out';
            gridContainer.style.opacity = '0';

            await new Promise(resolve => setTimeout(resolve, 1000));

            // Preparo el contenedor del slideshow;
            gridContainer.style.display = 'none';
            slideshowContainer.style.display = 'flex';
            slideshowContainer.style.opacity = '0';

            // Creo el slideshow;
            createSlideshow(selectedCard);

            slideshowContainer.offsetHeight;

            // Aplico la transición de fade in;
            slideshowContainer.style.transition = 'opacity 1s ease-in-out';
            slideshowContainer.style.opacity = '1';

            await new Promise(resolve => setTimeout(resolve, 1000));
            isAnimating = false;

        } else {
            // En desktop: aumento la escala de la tarjeta y hago la transición al slideshow;
            await new Promise(resolve => setTimeout(resolve, 500));
            selectedCard.style.transition = 'scale 1s ease-in-out';
            selectedCard.style.scale = '2';

            await new Promise(resolve => setTimeout(resolve, 1000));
            isAnimating = false;
            createSlideshow(selectedCard);
        }
    }
});

// Añado un event listener para los elementos "card-view-show";
document.addEventListener('click', async function (event) {
    const showButton = event.target.closest('.card-view-show');
    if (showButton) {
        isAnimating = true; // Desactivo el movimiento;

        // Obtengo el ID de la tarjeta desde el elemento más cercano que lo contenga;
        const listItem = showButton.closest('li');
        const cardId = listItem.querySelector('.glyph').textContent.replace('#', '');

        // Oculto el menú de índice si está abierto;
        const indexMenu = document.querySelector('.index-menu');
        if (indexMenu.classList.contains('deployed')) {
            indexMenu.classList.remove('deployed');
            const deployButton = document.getElementById('index-deploy');
            deployButton.textContent = 'ÍNDICE';
        }

        // Verifico si el slideshow está activo;
        const slideshowContainer = document.querySelector('.slideshow-container');
        const isSlideshowActive = slideshowContainer.style.display === 'flex';
        const isMobile = window.matchMedia('(max-width: 768px)').matches;

        if (isSlideshowActive) {
            // Si el slideshow está activo, hago fade out y lo vuelvo a crear con la tarjeta seleccionada en el centro;
            await fadeOutSlideshow();
            const selectedCard = document.querySelector(`.card-small[data-card-id="${cardId}"]`);
            if (selectedCard) {
                createSlideshow(selectedCard);
                await fadeInSlideshow();
            }
            isAnimating = false;
        } else {
            // Si el slideshow no está activo, la selección de tarjeta se hace desde el grid;
            const selectedCard = document.querySelector(`.card-small[data-card-id="${cardId}"]`);

            if (selectedCard) {
                // Activo el modo zoom;
                selectedCard.dataset.zoomActive = 'true';

                // 1. Oculto los elementos de la tarjeta;
                const cardNumber = selectedCard.querySelector('.card-number');
                const cardHover = selectedCard.querySelector('.card-hover');
                const bgBlur = selectedCard.querySelector('.bg-blur');

                cardNumber.style.transition = 'opacity .5s ease-in-out, visibility .5s ease-in-out';
                cardHover.style.transition = 'opacity .5s ease-in-out, visibility .5s ease-in-out';
                bgBlur.style.transition = 'opacity .5s ease-in-out, visibility .5s ease-in-out';

                cardNumber.style.opacity = '0';
                cardNumber.style.visibility = 'hidden';
                cardHover.style.opacity = '0';
                cardHover.style.visibility = 'hidden';
                bgBlur.style.opacity = '0';
                bgBlur.style.visibility = 'hidden';

                // Espero a que termine la transición;
                await new Promise(resolve => setTimeout(resolve, 500));

                // 2. Centro la tarjeta;
                await centerCard(selectedCard);

                // 3. Oculto el resto de tarjetas;
                await hideOtherCards(selectedCard);

                // 4. Aplico el modo oscuro;
                applyDarkMode();

                // 5. Transición del grid al slideshow;

                await new Promise(resolve => setTimeout(resolve, 500));

                if (isMobile) {
                    // En móvil: fade out del grid y creación del slideshow;
                    const gridContainer = document.querySelector('.grid-container');
                    gridContainer.style.transition = 'opacity 1s ease-in-out';
                    gridContainer.style.opacity = '0';

                    await new Promise(resolve => setTimeout(resolve, 1000));

                    // Preparo el contenedor del slideshow;
                    gridContainer.style.display = 'none';
                    slideshowContainer.style.display = 'flex';
                    slideshowContainer.style.opacity = '0';

                    // Creo el slideshow;
                    createSlideshow(selectedCard);

                    slideshowContainer.offsetHeight;

                    // Aplico fade in al slideshow;
                    slideshowContainer.style.transition = 'opacity 1s ease-in-out';
                    slideshowContainer.style.opacity = '1';

                    await new Promise(resolve => setTimeout(resolve, 1000));

                } else {
                    // En desktop: aumento la escala de la tarjeta y hago la transición al slideshow;
                    selectedCard.style.transition = 'scale 1s ease-in-out';
                    selectedCard.style.scale = '2';

                    // 6. Creo y muestro el slideshow y oculto el grid;
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    createSlideshow(selectedCard);
                }

                isAnimating = false; // Reactivo el movimiento;

            }
        }
    }
});

// Exporto las funciones;
export { restoreGrid, isAnimating, fadeOutSlideshow };