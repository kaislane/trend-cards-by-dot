// Función para obtener valor numérico de una variable CSS;
function getCSSVariable(name) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return parseInt(value) || parseFloat(value);
}

function getComputedCSSValue(propertyName) {
    const element = document.createElement('div');
    document.body.appendChild(element);
    element.style.width = getComputedStyle(document.documentElement).getPropertyValue(propertyName);
    const value = element.getBoundingClientRect().width;
    document.body.removeChild(element);
    return value;
}

// Dimensiones dinámicas que cambiarán según el viewport;
export let CARD_WIDTH, CARD_HEIGHT, CARD_GAP, GRID_COLUMNS, GRID_ROWS;
export let SLIDESHOW_CARD_WIDTH, SLIDESHOW_CARD_GAP;

// Función para actualizar las dimensiones cuando cambie el viewport;
export function updateDimensions(isMobile) {
    const prefix = isMobile ? '--mobile' : '--desktop';

    CARD_WIDTH = getComputedCSSValue(`${prefix}-card-width`);
    CARD_HEIGHT = getComputedCSSValue(`${prefix}-card-height`);
    CARD_GAP = getComputedCSSValue(`${prefix}-card-gap`);
    GRID_COLUMNS = getCSSVariable(`${prefix}-grid-columns`);
    GRID_ROWS = getCSSVariable(`${prefix}-grid-rows`);
    SLIDESHOW_CARD_WIDTH = getComputedCSSValue(`${prefix}-slideshow-card-width`);
    SLIDESHOW_CARD_GAP = getComputedCSSValue(`${prefix}-slideshow-card-gap`);
}

updateDimensions(window.matchMedia('(max-width: 768px)').matches);