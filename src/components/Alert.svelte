<script lang="ts">
	let dialog: any;
	let dialogMessage:string="";
	const Dialog = window.document.createElement('dialog').__proto__;
	if (!Dialog.showModal) {
		Dialog.showModal = function () {
			this.style.display = 'block';
			this.style.opacity = '1';
			this.style.pointerEvents = 'auto';
			this.setAttribute('open', '');
			return new Promise((resolve, reject) => {
				this.addEventListener('close', () => {
					this.removeAttribute('open');
					resolve('open');
				});
			});
		};
		Dialog.close = function () {
			this.style.display = 'none';
			this.removeAttribute('open');
			this.style.opacity = '0';
			this.style.pointerEvents = 'none';
			this.dispatchEvent(new Event('close'));
		};
	}
	window.alert = function (message) {
		dialogMessage = message;
		const show = () => { dialog.showModal && dialog.showModal(); };
		show();
	};
    function closeDialog() {
		const close = () => { dialog.close && dialog.close(); };
		close();
    }
</script>

<dialog bind:this={ dialog }>
	<p>{ dialogMessage }</p>
	<p style="text-align: right;">
		<button on:click={closeDialog}>Close</button>
	</p>
</dialog>
