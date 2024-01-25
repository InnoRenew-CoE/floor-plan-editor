<script lang="ts">
    import CustomCanvas from "$lib/components/CustomCanvas.svelte";
</script>

<div id="container">
    <CustomCanvas/>
</div>

<style>
    #container {
        display: flex;
        background-color: white;
        flex: 1;
    }

    #container canvas {
        flex: 1;
        background-color: rgba(0, 0, 0, .05);
        border: 1px solid rgba(0, 0, 0, .05);
    }
</style>