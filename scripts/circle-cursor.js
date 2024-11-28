const cursor = document.querySelector('.circle-cursor');

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

// Separo los dos tipos de cursor diferentes en hover;
// Cursor grande simple;
function bigCursorListener(element) {
    element.addEventListener('mouseover', () => {
        cursor.classList.add('big-cursor-hover');
    });

    element.addEventListener('mouseleave', () => {
        cursor.classList.remove('big-cursor-hover');
    });
}

// Cursor grande para las tarjetas del slideshow;
function eyeCursorListener(element) {
    element.addEventListener('mouseover', () => {
        cursor.classList.add('big-cursor-eye');
        cursor.innerHTML = `<svg width="30" height="20" viewBox="0 0 30 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M28.98 8.11081C25.965 3.03571 20.73 0 14.985 0C9.24 0 4.035 3.03571 1.005 8.11081L0 9.80769L1.005 11.5046C4.02 16.5797 9.255 19.6154 15 19.6154C20.745 19.6154 25.965 16.5797 28.995 11.5046L30 9.80769L28.98 8.11081ZM3.66 9.80769C5.565 6.58517 8.715 4.25 12.405 3.50275C10.065 4.54579 8.43 6.95879 8.43 9.76099C8.43 12.7656 10.305 15.3187 12.915 16.2216C9 15.5833 5.655 13.1859 3.645 9.82326L3.66 9.80769ZM17.07 16.206C19.665 15.3031 21.555 12.75 21.555 9.74542C21.555 6.94322 19.92 4.53022 17.58 3.48718C21.27 4.25 24.42 6.58517 26.325 9.79213C24.33 13.1548 20.985 15.5522 17.07 16.1905V16.206Z" fill="#1F1E1C"/>
        </svg>`;
    });

    element.addEventListener('mouseleave', () => {
        cursor.classList.remove('big-cursor-eye');
        cursor.innerHTML = '';
    });
}

// Inicializo los elementos existentes;
document.querySelectorAll('.big-cursor').forEach(bigCursorListener);
document.querySelectorAll('.card-hover-big').forEach(eyeCursorListener);

const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
                if (node.classList?.contains('big-cursor')) {
                    bigCursorListener(node);
                }
                if (node.classList?.contains('card-hover-big')) {
                    eyeCursorListener(node);
                }
                // Busco elementos anidados;
                node.querySelectorAll('.big-cursor').forEach(bigCursorListener);
                node.querySelectorAll('.card-hover-big').forEach(eyeCursorListener);
            }
        });
    });
});

// Configuro e inicio el observer;
observer.observe(document.body, {
    childList: true,
    subtree: true
});

