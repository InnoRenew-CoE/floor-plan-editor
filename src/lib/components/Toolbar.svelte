<div id="container">
    {#each {length: 5} as _, i}
        <div class="button">{i}</div>
    {/each}
</div>

<style>

    #container {
        position: absolute;
        display: flex;
        padding: .5em;
        background-color: white;
        box-shadow: 0 0 10px 5px rgba(0,0,0, .25);
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
        padding: .2em;
    }

    .button:hover {
        background-color: orange;
    }

</style>