<script>
  import { user } from "../store";
  export let width = 1;
  $: cssVarStyles = `--width:${width}%`;
  let avatar = "images/avatar/avatar-1.jpg";
  let fullname = "...";
  user.subscribe((user) => {
    avatar = user.attributes.avatar || "images/avatar/avatar-1.jpg";
    fullname = user.attributes.name || "...";
  });
</script>

<header>
  <span>
    <img class="logo" src="images/logo.svg" alt="logo" />
    <slot />
  </span>
  <div>
    <div class="notifications">
      <i class="fas fa-bell" />
      <mark>5</mark>
    </div>
    <figure>
      <img src={avatar} alt="user" />
      <figcaption>{fullname}</figcaption>
    </figure>
    <a class="logout" href="/">
      <i class="fas fa-sign-out-alt" />
      Logout
    </a>
  </div>
</header>

<style>
  /*.search {
    margin-top: 0px;
    margin-bottom: 0px;
    margin-right: 1rem;
  }*/
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
