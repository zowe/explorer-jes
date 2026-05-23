export default function debounce(func, wait, immediate) {
    let timeout;
    return function outputFunc(...params) {
        const context = this;
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(context, params);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, params);
    };
}
