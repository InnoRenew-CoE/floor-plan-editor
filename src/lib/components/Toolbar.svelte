<script lang="ts">
    import {currentState, roomStore, State} from "$lib/types/Graphics";

    function exportJSON() {
        const json = JSON.stringify($roomStore);
        console.log(json);
    }
</script>

<div id="toolbar">
    <button on:click={() => $currentState = $currentState === State.Drawing ? State.Idle:State.Drawing}>Toggle</button>
    Current state: {$currentState}
    <div style="height: 1px; width: 100%; background-color: darkgray"></div>
    <button on:click={exportJSON}>Export JSON</button>
    <button>Import SVG</button>
</div>


<style>
    #toolbar {
        font-family: Arial, sans-serif;
        border-radius: 3px;
        padding: 1rem;
        background-color: white;
        box-shadow: 0 0 10px 5px rgba(0, 0, 0, .15);
        border: 1px solid rgba(0, 0, 0, .3);
        position: absolute;
        top: 1rem;
        left: 1rem;
        display: grid;
        grid-template-columns: 1fr;
        gap: 1em;
    }

    button {
        border: 1px solid darkgray;
        padding: 0.5em;
    }
</style>
