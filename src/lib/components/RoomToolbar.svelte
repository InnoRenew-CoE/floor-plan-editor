<script lang="ts">
    import {currentRoom, type Room, roomStore} from "$lib/types/Graphics";
    import Polygon from "polygon";
    import type {Renderer} from "$lib/types/Renderer";
    import {onMount} from "svelte";

    export let room: Room
    let clone = {...room}
    export let renderer: Renderer
    let center = {x: 0, y: 0};

    onMount(async () => {
        const roomPoints = room.lines.map(x => renderer.fakeToReal(x.end!))
        const polygon = new Polygon(roomPoints);
        center = polygon.center();
    })

    function save() {
        room.name = clone.name
        $currentRoom = undefined;
        renderer.redraw();
    }

    function reset() {
        $roomStore = $roomStore.filter(r => r !== room)
        $currentRoom = undefined;
        renderer.setRooms($roomStore);
        renderer.redraw()
    }
</script>
{#if center.x !== 0 && center.y !== 0}
    <form id="toolbar" style="left: {center.x}px; top: {center.y + 10}px" on:submit|preventDefault={save} on:reset|preventDefault={reset}>
        <label>Room name: </label>
        <input bind:value={clone.name}/>
        <div style="display: flex; width: 100%; justify-content: space-between; align-items: center; margin-top: 10px">
            <button type="reset">Delete</button>
            <button type="submit">Save</button>
        </div>
    </form>
{/if}

<style>
    #toolbar {
        position: absolute;
        background-color: white;
        padding: 1em;
        border-radius: 3px;
        box-shadow: 0 0 10px 5px rgba(0, 0, 0, .15);
    }

    button {
        border: 1px solid darkgray;
        border-radius: 3px;
    }

</style>