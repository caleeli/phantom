<script lang="ts">
	import { onMount } from 'svelte';

	// expandido por defecto
	let aside="expanded";
	// avatar aleatorio
	let avatar="https://i.pravatar.cc/300";
	// colapsa el menu lateral
	function collapseSidebar() {
		aside="collapsed";
	}
	// expande el menu lateral
	function expandSidebar() {
		aside="expanded";
	}
	onMount(() => {
		// focus first visible input or select in main content
		const input = document.querySelector('main input, main select');
		if (input) {
			input.focus();
		}
	});
</script>

<header>Talento Humano</header>

<aside class={aside}>
	<button id="hide-sidebar" on:click={collapseSidebar}><i class="fas fa-chevron-circle-left"></i></button>
	<button id="show-sidebar" on:click={expandSidebar}><i class="fas fa-chevron-circle-right"></i></button>
	<figure>
		<img src={avatar} alt="user">
		<figcaption>
			@username
		</figcaption>
	</figure>
	<a class="active" href="#/home"><i class="fas fa-home"></i> <span>Home</span></a>
	<a href="#/users"><i class="fas fa-users"></i> <span>Users</span></a>
	<a href="#/about"><i class="fas fa-question-circle"></i> <span>About</span></a>
	<footer>
		<span>© 2021 phantom</span>
	</footer>
</aside>

<main>
	<h1>Busqueda de candidatos</h1>
	<form>
		<h2>Buttons</h2>
		<nav>
			<button>
				Perfiles<br>
				<i class="fas fa-id-card-alt"></i>
				<mark>5</mark>
			</button>
			<i class="fas fa-arrow-right"></i>
			<button type="button">
				Fuentes de reclutamiento<br>
				<i class="fas fa-globe"></i>
				<mark>2</mark>
			</button>
			<i class="fas fa-arrow-right"></i>
			<button type="reset">
				Potenciales<br>
				<i class="fas fa-users"></i>
				<mark>14</mark>
			</button>
			<i class="fas fa-arrow-right"></i>
			<button type="submit">
				Contactos<br>
				<i class="fas fa-address-card"></i>
				<mark>8</mark>
			</button>
			<i class="fas fa-arrow-right"></i>
			<button type="reset">
				Evaluación<br>
				<i class="fas fa-check-circle"></i>
				<mark>5</mark>
			</button>
		</nav>
		<fieldset>
			<legend>
				<i class="fas fa-search"></i>
				Buscar
			</legend>
			<input type="text" size="47" placeholder="Buscar por nombre, apellido, cédula, etc.">
			<select name="country">
				<option value="">Seleccione un país</option>
				<option value="Argentina">Argentina</option>
				<option value="Bolivia">Bolivia</option>
				<option value="Brasil">Brasil</option>
				<option value="Chile">Chile</option>
				<option value="Colombia">Colombia</option>
				<option value="Ecuador">Ecuador</option>
				<option value="Perú">Perú</option>
				<option value="Paraguay">Paraguay</option>
				<option value="Uruguay">Uruguay</option>
				<option value="Venezuela">Venezuela</option>
			</select>
			<input type="text" placeholder="disabled" disabled>
			<select name="country" disabled>
				<option value="">Seleccione un país</option>
				<option value="Argentina">Argentina</option>
				<option selected value="Bolivia">Bolivia</option>
				<option value="Brasil">Brasil</option>
				<option value="Chile">Chile</option>
				<option value="Colombia">Colombia</option>
				<option value="Ecuador">Ecuador</option>
				<option value="Perú">Perú</option>
				<option value="Paraguay">Paraguay</option>
				<option value="Uruguay">Uruguay</option>
				<option value="Venezuela">Venezuela</option>
			</select>
		</fieldset>
		<!-- Login form -->
		<fieldset>
			<legend>
				<i class="fas fa-lock"></i>
				Login
			</legend>
			<input type="email" placeholder="Correo electrónico">
			<input type="password" placeholder="Contraseña">
			<button type="submit">
				Iniciar sesión
			</button>
			<label>
				<input type="checkbox" name="remember" id="remember">
				Recordarme
			</label>
			<label>
				<input type="checkbox" name="remember" disabled>
				<input type="checkbox" name="remember" disabled checked>
				Recordarme (Disabled)
			</label>
			<!-- radio buttons -->
			<nav>
				<label>
					<input type="radio" name="color" value="red">
					Rojo
				</label>
				<label>
					<input type="radio" name="color" value="green">
					Verde
				</label>
				<label>
					<input type="radio" name="color" value="blue">
					Azul
				</label>
				<label>
					<input type="radio" name="color" value="yellow">
					Amarillo
				</label>
				<label>
					<input type="radio" name="color" value="orange" disabled checked>
					Naranja
				</label>
			</nav>
		</fieldset>

		<nav>
			<button>
				default
			</button>
			<button type="button">
				button
			</button>
			<button type="reset">
				reset
			</button>
			<button type="submit">
				submit
			</button>
			<button type="submit" disabled>
				submit
			</button>
		</nav>
		<textarea></textarea>
		<div>
			<label for="exampleFormControlSelect2">Example multiple select</label>
			<select multiple size="5" id="exampleFormControlSelect2">
				<option>1</option>
				<option>2</option>
				<option>3</option>
				<option>4</option>
				<option>5</option>
			</select>
		</div>
		<div>
			<label for="exampleFormControlFile1">Example file input</label>
			<input type="file" id="exampleFormControlFile1">
		</div>
	</form>
</main>

<style>

</style>