<script lang="ts">
	let dialog;
	let dialogMessage;
	window.alert = function(message) {
		dialogMessage = message;
		dialog.showModal();
	};
    function closeDialog() {
        dialog.close();
    }
</script>

<dialog bind:this={ dialog }>
	{ dialogMessage }
	<div style="text-align: right;margin-top:1rem;">
		<button on:click={closeDialog}>Close</button>
	</div>
</dialog>
