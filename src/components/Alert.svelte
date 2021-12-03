<script lang="ts">
	let dialog: any;
	let dialogMessage:string="";
	window.alert = function (message) {
		dialogMessage = message;
		const show = dialog.showModal || (() => null);
		show();
	};
    function closeDialog() {
		const close = dialog.close || (() => null);
		close();
    }
</script>

<dialog bind:this={ dialog }>
	<p>{ dialogMessage }</p>
	<p style="text-align: right;">
		<button on:click={closeDialog}>Close</button>
	</p>
</dialog>
