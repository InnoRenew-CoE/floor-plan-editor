<script lang="ts">
    import {ActionState, type CanvasElement, CanvasElementType, currentActionState, objectStore, type Room, roomStore} from "$lib/types/Graphics";
    import {fade} from "svelte/transition";

    type Button = {
        icon: string,
        action: () => void
    }

    const buttons: Button[] = [
        {icon: "/point.svg", action: drawLine},
        {icon: "/doors.svg", action: () => addDoor(false)},
        {icon: "/double-doors.svg", action: () => addDoor(true)},
        {icon: "/window.svg", action: addWindow},
        {icon: "/import.svg", action: importData},
        {icon: "/export.svg", action: exportData},
    ];

    function drawLine() {
        $currentActionState = $currentActionState === ActionState.Drawing ? ActionState.None : ActionState.Drawing;
    }

    function addDoor(double: Boolean = false) {
        objectStore.update(objects => {
            objects.push({
                position: {x: 0, y: 0},
                rotation: 0,
                type: double ? CanvasElementType.DoubleDoor : CanvasElementType.Door,
            })
            return objects;
        })
    }

    function addWindow() {
        objectStore.update(objects => {
            objects.push({
                position: {x: 0, y: 0},
                rotation: 0,
                type: CanvasElementType.Window,
            })
            return objects;
        })
    }

    function importData() {
        const uploadElement = document.createElement("input");
        uploadElement.type = "file";
        uploadElement.style.display = "none";
        uploadElement.click();
        uploadElement.onchange = async (event) => {
            const file = uploadElement.files.item(0);
            const json: { rooms: Room[], objects: CanvasElement[] } = JSON.parse(await file.text());
            roomStore.set(json.rooms);
            objectStore.set(json.objects)
            uploadElement.remove();
        }

    }

    function exportData() {
        const data = {
            rooms: $roomStore,
            objects: $objectStore
        }
        const json = JSON.stringify(data);
        const blob = new File([json], "floor-plan.json", {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        document.body.appendChild(a);
        a.style.display = "none";
        a.href = url;
        a.download = "floor-plan.json";
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

</script>
<div id="container">
    {#if $currentActionState === ActionState.Drawing}
        <div in:fade out:fade id="drawing-indicator"></div>
    {/if}
    {#each buttons as button, i}
        <div class="button-container">
            <button class="button" style="mask-image: url('{button.icon}')" on:click={button.action}></button>
        </div>
    {/each}
</div>

<style>

    #container {
        position: absolute;
        display: flex;
        padding: .5em;
        background-color: white;
        box-shadow: 0 0 10px 5px rgba(0, 0, 0, .25);
        bottom: 1em;
        min-width: 400px;
        margin: 0 auto;
        left: 0;
        right: 0;
        width: min-content;
        border: 1px solid black;
        border-radius: .25em;
    }

    #container:hover {

    }

    .button {
        width: 2em;
        height: 2em;
        background-color: black;
        mask-size: 80%;
        mask-repeat: no-repeat;
        mask-position: center;
    }

    .button:hover {
        background-color: orange;
    }

    .button-container {
        border-right: 1px solid rgba(0, 0, 0, .1);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 1em;
    }

    #drawing-indicator {
        position: absolute;
        top: .25em;
        left: 2.25em;
        padding: .25em;
        background-color: hotpink;
        border-radius: 100%;
    }

</style>