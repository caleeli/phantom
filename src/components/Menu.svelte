<script type="ts">
import { location } from 'svelte-spa-router'
	// expandido por defecto
	let aside=isMobile() ? "collapsed" : "expanded";
	// avatar aleatorio
	let avatar="images/avatar/avatar-1.jpg";
	// colapsa el menu lateral
	function collapseSidebar() {
		aside="collapsed";
	}
	// expande el menu lateral
	function expandSidebar() {
		aside="expanded";
	}
	// check if is a mobile device
	function isMobile() {
		return window.innerWidth < 768;
	}
</script>

<aside class={aside}>
    <button id="hide-sidebar" on:click={collapseSidebar}><i class="fas fa-chevron-circle-left"></i></button>
    <button id="show-sidebar" on:click={expandSidebar}><i class="fas fa-chevron-circle-right"></i></button>
	<div class="figure-bg">
		<figure>
			<img src={avatar} alt="user">
			<figcaption>
				@juan
			</figcaption>
		</figure>
	</div>
    <a class={$location=='/home' ? 'active' : ''} href="#/home"><i class="fas fa-home"></i> <span>Inicio</span></a>
    <a class={$location=='/dashboard' ? 'active' : ''} href="#/dashboard"><i class="fas fa-tachometer-alt"></i> <span>Dashboard</span></a>
    <a href="#/page/users"><i class="fas fa-users"></i> <span>Users</span></a>
    <a href="#/about"><i class="fas fa-question-circle"></i> <span>About</span></a>
    <footer>
        <span>© 2021 coredump</span>
    </footer>
</aside>

<style>
</style>