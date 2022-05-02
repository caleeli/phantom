<script>
  import { user } from "../store";
  import PopupMenu from "./PopupMenu.svelte";
  import dayjs from "dayjs";
  import Api from "./Api.svelte";
  import api from "../api";
  import { translations as _ } from "../helpers";

  let avatar = "images/avatar/avatar-1.jpg";
  let showNotifications = false;
  let notifications = [];
  let refreshNotifications = 1;
  let fullname = "...";
  user.subscribe((user) => {
    avatar = user.attributes.avatar || "images/avatar/avatar-1.jpg";
    fullname = user.attributes.name || "...";
  });
  function toggle_notifications() {
    refreshNotifications++;
    showNotifications = !showNotifications;
  }
  async function markNotificationRead(notification) {
    notification.attributes.read = 1;
    await api("notifications").put(notification.id, {
      data: notification,
    });
    refreshNotifications++;
  }
</script>

<header>
  <span>
    <img class="logo" src="images/logo.svg" alt="logo" />
    <slot />
  </span>
  <div>
    <div class="notifications" on:click|stopPropagation={toggle_notifications}>
      <i class="fas fa-bell" />
      <mark>{notifications.length}</mark>
      <PopupMenu bind:show={showNotifications}>
        <Api
          path="notifications?filter[]=myUnreadNotifications()"
          bind:value={notifications}
          bind:refresh={refreshNotifications}
        >
          {#each notifications as notification}
            <div
              class="notification"
              on:click={() => markNotificationRead(notification)}
            >
              <strong>{notification.attributes.title}</strong>
              <div>{notification.attributes.message}</div>
              <small
                >{dayjs(
                  notification.attributes.timeout * 1000
                ).fromNow()}</small
              >
            </div>
          {/each}
        </Api>
        {#if notifications.length === 0}
          <div class="no-notifications">
            <i class="fas fa-bell-slash" />
            <span>{_("No notifications")}</span>
          </div>
        {/if}
      </PopupMenu>
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
  .notifications {
    position: relative;
    width: 3rem;
    cursor: pointer;
  }
  .notifications mark {
    position: absolute;
    top: -10px;
    left: 0.5rem;
  }
  .notification {
    width: calc(100% - 1rem);
    display: grid;
    grid-template-columns: 4fr 1fr;
    grid-template-rows: repeat(2, 1fr);
    grid-column-gap: 0px;
    grid-row-gap: 0px;
    padding: 0.5rem;
    border-bottom: 1px solid var(--input-border);
  }
  .notification:hover {
    background-color: var(--button-submit-bg);
  }
  .notification > strong {
    grid-area: 1 / 1 / 2 / 2;
  }
  .notification > div {
    grid-area: 2 / 1 / 3 / 2;
  }
  .notification > small {
    grid-area: 1 / 2 / 3 / 3;
    text-align: right;
  }
</style>
