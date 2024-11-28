// Función para aplicar el modo oscuro;
export function applyDarkMode() {
    const dotLogo = document.querySelector('.dot-logo');
    const menuItems = document.querySelectorAll('.hover-black');
    const bottomInfo = document.querySelector('.bottom-info');
    const bottomInfoMobile = document.querySelector('.bottom-info-mobile');
    const indexMenu = document.querySelector('.index-menu');
    const bottomInfoSlideshow = document.querySelector('.bottom-info-slideshow-container');

    // Cambio el color de fondo del body;
    document.body.style.backgroundColor = 'var(--black)';

    // Cambio el color del logo;
    dotLogo.style.fill = 'var(--white)';

    // Actualizo las clases de los elementos del menú superior;
    menuItems.forEach(item => {
        item.classList.remove('hover-black');
        item.classList.add('hover-white');
        item.classList.remove('bg-white');
        item.classList.add('bg-black');
        item.classList.remove('border-black');
        item.classList.add('border-white');
    });

    // Actualizo las clases del bottom-info;
    bottomInfo.style.visibility = 'hidden';
    bottomInfoMobile.style.visibility = 'hidden';
    bottomInfoSlideshow.style.visibility = 'visible';


    // Actualizo los estilos del index-menu;
    indexMenu.style.backgroundColor = 'rgba(31, 30, 28, 0.9)';
    indexMenu.style.color = 'var(--white)';
    indexMenu.querySelectorAll('li').forEach(li => {
        li.style.borderTop = 'solid 1px var(--white)';
    });
}

// Función para aplicar el modo claro;
export function applyLightMode() {
    const dotLogo = document.querySelector('.dot-logo');
    const menuItems = document.querySelectorAll('.hover-white');
    const bottomInfo = document.querySelector('.bottom-info');
    const bottomInfoMobile = document.querySelector('.bottom-info-mobile');
    const indexMenu = document.querySelector('.index-menu');
    const bottomInfoSlideshow = document.querySelector('.bottom-info-slideshow-container');

    // Cambio el color de fondo del body;
    document.body.style.backgroundColor = 'var(--white)';

    // Cambio el color del logo;
    dotLogo.style.fill = 'var(--black)';

    // Actualizo las clases de los elementos del menú superior;
    menuItems.forEach(item => {
        item.classList.remove('hover-white');
        item.classList.add('hover-black');
        item.classList.remove('bg-black');
        item.classList.add('bg-white');
        item.classList.remove('border-white');
        item.classList.add('border-black');
    });

    // Actualizo las clases del bottom-info;
    bottomInfo.style.visibility = 'visible';
    bottomInfoMobile.style.visibility = 'visible';
    bottomInfoSlideshow.style.visibility = 'hidden';

    // Actualizo los estilos del index-menu;
    indexMenu.style.backgroundColor = 'rgba(255, 250, 250, 0.9)';
    indexMenu.style.color = 'var(--black)';
    indexMenu.querySelectorAll('li').forEach(li => {
        li.style.borderTop = 'solid 1px var(--black)';
    });
}
