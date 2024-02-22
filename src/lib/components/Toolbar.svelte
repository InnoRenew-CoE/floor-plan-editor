<script lang="ts">
    import {ActionState, CanvasElementType, currentActionState, objectStore} from "$lib/types/Graphics";

    type Button = {
        icon: string,
        action: () => void
    }

    const buttons: Button[] = [
        {icon: "/point.svg", action: drawLine},
        {icon: "/doors.svg", action: addDoor},
    ];

    function drawLine() {
        $currentActionState = ActionState.Drawing;
    }

    function addDoor() {
        objectStore.update(objects => {
            objects.push({
                position: {x: 0, y: 0},
                rotation: 0,
                type: CanvasElementType.Door,
            })
            return objects;
        })
    }
</script>

<div id="container">
    {#each buttons as button, i}
        <div class="button-container">
            <div class="button" style="mask-image: url('{button.icon}')" on:click={button.action}></div>
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

</style>