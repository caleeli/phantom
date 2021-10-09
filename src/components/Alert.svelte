<script lang="ts">
	let dialog: any;
	let dialogMessage:string="";
	window.alert = function (message) {
		dialogMessage = message;
		if (dialog.showModal) {
			dialog.showModal();
		}
	};
    function closeDialog() {
		if (dialog.close) {
        	dialog.close();
		}
    }
</script>

<dialog bind:this={ dialog }>
	<p>{ dialogMessage }</p>
	<p style="text-align: right;">
		<button on:click={closeDialog}>Close</button>
	</p>
</dialog>
