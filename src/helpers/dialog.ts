const Dialog = window.document.createElement('dialog')['__proto__'];
if (!Dialog.showModal) {
    // Listen ESC key
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            const dialogs = window.document.querySelectorAll('dialog');
            for (let i = 0; i < dialogs.length; i++) {
                if (dialogs[i]['open']) {
                    setTimeout(() => {
                        dialogs[i]['close']();
                    }, 0);
                }
            }
        }
    });
    Dialog.showModal = function () {
        this.style.display = 'block';
        this.style.opacity = '1';
        this.style.pointerEvents = 'auto';
        this.style.marginTop = '50%';
        this.style.top = '-50%';
        this.setAttribute('open', '');
        this.open = true;
    };
    Dialog.close = function () {
        this.style.display = 'none';
        this.removeAttribute('open');
        this.style.opacity = '0';
        this.style.pointerEvents = 'none';
        this.open = false;
        let event = new Event('close', {});
        this.dispatchEvent(event);
    };
}

export default Dialog;
