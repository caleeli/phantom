<script>
	import { createEventDispatcher } from "svelte";
	import api from "../api";
	import { _ } from "../helpers";

	export let value;
	const dispatch = createEventDispatcher();
	async function uploadFile(fileupload) {
		let formData = new FormData();
		formData.append("file", fileupload.files[0]);
		return api("upload")
			.post(formData)
			.then((data) => {
				dispatch("input", {
					value: data.attributes.url,
				});
				// clean select file
				fileupload.value = "";
			});
	}
	function fileName(url) {
		return url.split("/").pop();
	}
</script>

<div class={`input-file input ${$$restProps.class}`}>
	<button class="input__button">
		{_("Choose a file")}
	</button>
	{fileName(value)}
	<slot />
	<input
		{...$$restProps}
		type="file"
		title={_("Choose a file")}
		on:change={(event) => {
			uploadFile(event.target);
		}}
	/>
</div>

<style>
	.input__button {
		margin: 0px;
		cursor: pointer;
	}
	.input-file {
		position: relative;
	}
	.input-file input:last-child {
		position: absolute;
		top: 0;
		left: 0;
		border-radius: 0;
		width: 100%;
		height: 100%;
		opacity: 0;
		cursor: pointer;
	}
</style>
