<script>
  export let width = 1;
  $: cssVarStyles = `--width:${width}%`;
	// avatar aleatorio
	let avatar="images/avatar/avatar-1.jpg";
  // let avatar="https://scutum-universal.tzdthemes.com/_nuxt/img/avatar_default_sm.3ea819b.png";
</script>

<header>
  <span>
    <img class="logo" src="images/logo.svg" alt="logo">
    <slot />
  </span>
  <div>
    <input placeholder="search" class="search">
    <div class="notifications">
      <i class="fas fa-bell"></i>
      <mark>5</mark>
    </div>
    <figure>
      <img src={avatar} alt="user">
      <figcaption>Juan Perez</figcaption>
    </figure>
    <a class="logout" href="/">
      <i class="fas fa-sign-out-alt"></i>
      Logout
    </a>
  </div>
</header>

<style>
  .search {
    margin-top: 0px;
    margin-bottom: 0px;
    margin-right: 1rem;
  }
  .notifications {
    position: relative;
    width: 3rem;
  }
  .notifications mark {
    position: absolute;
    top: -10px;
    left: 0.5rem;
  }
</style>
