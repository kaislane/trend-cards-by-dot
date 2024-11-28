// Adaptación del menú para pantallas móviles;
// Adaptación del "bottom-info" para pantallas móviles;
// Gestión del pop-up inicial;

const mobileBreakpoint = window.matchMedia('(max-width: 768px)');
const menuButtonMobile = document.querySelector('.menu-button-mobile');
const menuButton = document.querySelector('.menu-button');
const closeButton = document.querySelector('.close-button-popup');
const cardPopup = document.querySelector('.card-popup');

const bottomInfoMobile = document.querySelector('.bottom-info-mobile');
const bottomInfo = document.querySelector('.bottom-info');
const bottomInfoSlideshow = document.querySelector('.bottom-info-slideshow');
const backButton = document.querySelector('.back-button');

// Funciones para el pop-up;
const showPopup = () => {
    cardPopup.style.visibility = 'visible';
    setTimeout(() => {
        cardPopup.style.opacity = '1';
    }, 10);
};

const hidePopup = () => {
    cardPopup.style.opacity = '0';
    setTimeout(() => {
        cardPopup.style.visibility = 'hidden';
    }, 500);
};

function toggleMenuButtons(e) {
    if (e.matches) {
        // Pantalla móvil (<=768px);
        menuButtonMobile.style.display = 'flex';
        menuButton.style.display = 'none';
        bottomInfoMobile.style.display = 'flex';
        bottomInfo.style.display = 'none';
        bottomInfoSlideshow.style.display = 'none';
        backButton.querySelector('p').textContent = 'Volver';

    } else {
        // Pantalla desktop (>768px);
        menuButtonMobile.style.display = 'none';
        menuButton.style.display = 'flex';
        bottomInfoMobile.style.display = 'none';
        bottomInfo.style.display = 'flex';
        bottomInfoSlideshow.style.display = 'flex';
        backButton.querySelector('p').textContent = 'Volver a la colección';
    }
}

// Event listeners;
document.addEventListener('DOMContentLoaded', () => {
    toggleMenuButtons(mobileBreakpoint);

    // Event listeners para el pop-up;
    menuButton.addEventListener('click', showPopup);
    menuButtonMobile.addEventListener('click', showPopup);
    closeButton.addEventListener('click', hidePopup);

    // Cerrar con esc;
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && cardPopup.style.visibility !== 'hidden') {
            hidePopup();
        }
    });
});

mobileBreakpoint.addEventListener('change', toggleMenuButtons);






