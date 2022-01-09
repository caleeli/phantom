const Dialog = window.document.createElement('dialog')['__proto__'];
if (!Dialog.showModal) {
    Dialog.showModal = function () {
        this.style.display = 'block';
        this.style.opacity = '1';
        this.style.pointerEvents = 'auto';
        this.setAttribute('open', '');
    };
    Dialog.close = function () {
        this.style.display = 'none';
        this.removeAttribute('open');
        this.style.opacity = '0';
        this.style.pointerEvents = 'none';
    };
}

export default Dialog;
