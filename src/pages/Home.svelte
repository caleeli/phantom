<script>
import Menu from "../components/Menu.svelte";
import DropList from "../components/DropList.svelte";
let tasks = [
    {
        name: "Pendientes",
        items: [
            {
                id: 1,
                name: "Tarea 1",
                done: false
            },
            {
                id: 2,
                name: "Tarea 2",
                done: false
            },
        ]
    },
    {
        name: "Completadas",
        items: [
            {
                id: 3,
                name: "Tarea 3",
                done: true
            },
            {
                id: 4,
                name: "Tarea 4",
                done: true
            },
        ]
    },
];
</script>

<header>Inicio</header>

<Menu />

<main>
    <nav>
        {#each tasks as task}
        <form>
            <leyend>{task.name}</leyend>
            <DropList class="abc" let:item bind:items={task.items}>
                <div class="card">
                    <div class="user"><img class="avatar" alt ="avatar" src="images/user-regular.svg" onerror="this.onerror=null;this.src='images/user-regular.svg';"></div>
                    <div class="task">{item.name}</div>
                    <div class="bar">
                        <button><i class="fas fa-pen"></i></button>
                        <button><i class="far fa-comment"></i></button>
                        <button type="reset"><i class="fas fa-trash"></i></button>
                        <div>2 días</div>
                    </div>
                </div>
            </DropList>
        </form>
        {/each}
    </nav>
</main>

<style>
    :global(.abc) {
        width: 250px;
        height: 300px;
    }
    .card {
        border: 1px solid #DFCF41;
        margin-top: 1rem;
        background: #FFED4A;
        border-radius: 4px;
        display: grid;
        grid-template-columns: 3rem 1fr;
        grid-template-rows: 1fr auto;
        gap: 0px 0px;
        grid-auto-flow: row;
        grid-template-areas:
            "user task"
            "bar bar";
    }
    .user {
        grid-area: user;
        justify-self: center;
        align-self: start;
        padding-top: 0.25rem;
    }
    .task {
        grid-area: task;
        justify-self: start;
        align-self: start;
        padding-top: 0.25rem;
    }
    .bar {
        grid-area: bar;
        justify-self: start;
        align-self: center;
        width: calc(100% - 1rem);
        background: #F7E547;
        padding: 0rem 0.5rem;
        border-top: 1px solid #DFCF41;
        display: flex;
        flex-direction: row;
        align-items: center;
    }
    .bar button {
        padding: 0rem 0.25rem;
        margin-right: 0px;
        margin-bottom: 2px;
    }
    .bar > div {
        flex-grow: 1;
        text-align: right;
    }
</style>
