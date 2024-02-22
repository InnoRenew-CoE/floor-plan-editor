<script lang="ts">
    import {onMount} from "svelte";
    import {fade} from "svelte/transition";
    import {ActionState, CanvasElementType, currentActionState, currentLinesStore, currentlySelectedObject, objectStore, type Point2D, type Room} from "$lib/types/Graphics";
    import Polygon from "polygon";
    import {FloorRenderer} from "$lib/components/FloorRenderer";

    let floorRenderer: FloorRenderer;
    let mouseDown: boolean = false;
    let toolbar: HTMLElement | undefined
    let toolbarPosition: Point2D = {x: 0, y: 0}

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let windowHeight: number, windowWidth: number

    const minimumPointSize = 20
    let lineWidth: number = 10;
    let pointSize = minimumPointSize

    let mousePosition: Point2D = {x: 0, y: 0}
    let moveStartPosition: Point2D = mousePosition

    function move(event: MouseEvent) {
        mousePosition = {x: event.clientX, y: event.clientY}
        if (event.button == 1 || 1 == event.button & 2) { // Middle button = 1, Left = 0, Right = 2
            let distanceX = event.clientX - moveStartPosition.x
            let distanceY = event.clientY - moveStartPosition.y

            floorRenderer.canvasOffset.x += distanceX
            floorRenderer.canvasOffset.y += distanceY
            moveStartPosition = {...mousePosition}
            $currentlySelectedObject = undefined;
        }
        if (mouseDown) onDrag()
    }

    onMount(async () => {
        floorRenderer = new FloorRenderer(canvas);
        ctx = floorRenderer.ctx;
        floorRenderer.dpiFix(windowWidth, windowHeight);
        floorRenderer.canvasOffset = floorRenderer.centerPosition
        floorRenderer.redraw()
    })

    $: if (windowHeight) floorRenderer.dpiFix(windowWidth, windowHeight);
    $: if (windowWidth) floorRenderer.dpiFix(windowWidth, windowHeight);
    $: if (mousePosition) {
        floorRenderer?.redraw()
        floorRenderer?.drawGrid(canvas.clientWidth, canvas.clientHeight);
        drawCurrentLine()

        if (floorRenderer) {
            const ctx = floorRenderer.ctx;
            const first = $currentLinesStore[0]
            if (first) {
                ctx.strokeStyle = "orange"
                ctx.lineWidth = lineWidth
                const transformed = floorRenderer.transformFakeToDrawable(first.start);
                ctx.beginPath()
                ctx.moveTo(transformed.x, transformed.y)
                $currentLinesStore.forEach((line) => floorRenderer.drawLine(line))
                ctx.stroke()
            }
        }
    }
    $: if (pointSize) floorRenderer?.redraw()
    $: if ($currentActionState) floorRenderer?.redraw()
    $: if ($currentlySelectedObject) {
        floorRenderer?.redraw()
    }

    function onClick(event: MouseEvent) {
        const gridPosition = floorRenderer.transformRealToFake({x: event.clientX, y: event.clientY})
        if (event.movementX > 0 || event.movementY > 0) return;
        if ($currentActionState === ActionState.Drawing) {
            const linesCount = $currentLinesStore.length
            const lastLine = $currentLinesStore[linesCount - 1];
            const existingLine = lastLine ?? {start: {x: gridPosition.x, y: gridPosition.y}, end: {x: gridPosition.x, y: gridPosition.y}}
            console.log($currentLinesStore.length)
            if (!$currentLinesStore.includes(existingLine)) {
                currentLinesStore.update(lines => {
                    lines.push(existingLine);
                    return lines;
                })
            }
            if (JSON.stringify(gridPosition) !== JSON.stringify(existingLine.start)) {
                existingLine.end = gridPosition;
                if (JSON.stringify(existingLine.end) === JSON.stringify($currentLinesStore[0].start)) {
                    const polygon = new Polygon($currentLinesStore.map(x => x.end));
                    const center = polygon.center()
                    const newRoom: Room = {
                        lines: [...$currentLinesStore],
                        quality: Math.random(),
                        position: {x: center.x, y: center.y},
                        rotation: 0,
                        type: CanvasElementType.Door,
                    }
                    $currentLinesStore = []
                    $currentActionState = ActionState.None
                    floorRenderer.rooms = [...floorRenderer.rooms, newRoom]
                } else {
                    currentLinesStore.update(lines => {
                        lines.push({start: {x: gridPosition.x, y: gridPosition.y}, end: {x: gridPosition.x, y: gridPosition.y}});
                        return lines;
                    })
                }
                return
            }
        } else {
            const area = [
                {x: gridPosition.x - 2, y: gridPosition.y - 2},
                {x: gridPosition.x - 2, y: gridPosition.y + 2},
                {x: gridPosition.x + 2, y: gridPosition.y + 2},
                {x: gridPosition.x + 2, y: gridPosition.y - 2},
                {x: gridPosition.x - 2, y: gridPosition.y - 2},
            ]
            const polygon = new Polygon(area);
            const firstObjectOnGridPosition = floorRenderer.objects.find(x => polygon.contains({x: x.position.x, y: x.position.y, w: 0, h: 0}))
            $currentlySelectedObject = firstObjectOnGridPosition;
            toolbarPosition = mousePosition
        }
    }

    function drawCurrentLine() {
        const line = $currentLinesStore[$currentLinesStore.length - 1];
        if (ctx && line) {
            const direction = floorRenderer.getLineDirection(line);
            const transformedStart = floorRenderer.transformFakeToDrawable(line.start);
            line.end = floorRenderer.transformRealToFake(mousePosition);
            ctx.beginPath()
            floorRenderer.drawLine(line);
            ctx.lineWidth = lineWidth
            ctx.stroke()
            ctx.fillStyle = "black"
            floorRenderer.displayLineDistance(line, {x: mousePosition.x + pointSize, y: mousePosition.y - pointSize});
        }
    }


    function onDrag() {
        const currentObject = $currentlySelectedObject;
        if (!currentObject) return;
        currentObject.position = floorRenderer.transformRealToFake({x: mousePosition.x - 10, y: mousePosition.y + 10})
        toolbarPosition = mousePosition
    }

    function rotateObject() {
        const object = $currentlySelectedObject;
        if (!object) return
        object.rotation += 0.5
        if (object.rotation === 2.0) object.rotation = 0;
        floorRenderer?.redraw();
    }

    $: if(floorRenderer) floorRenderer.objects = $objectStore
</script>
<svelte:window bind:innerHeight={windowHeight} bind:innerWidth={windowWidth}/>
<canvas
        bind:this={canvas}
        on:click={onClick}
        on:mousedown={e =>{
            moveStartPosition = {x: e.clientX, y: e.clientY}
            mouseDown = e.button === 0;
        }}
        on:mouseenter={e => (moveStartPosition = {x: e.clientX, y: e.clientY})}
        on:mousemove={move}
        on:mouseup={() => {mouseDown = false}}
/>
{#if toolbarPosition && $currentlySelectedObject}
    <div in:fade out:fade
         bind:this={toolbar} id="toolbar"
         style="left: {toolbarPosition.x - ((toolbar?.clientWidth / 2) ?? 0)}px; top: {toolbarPosition.y + 2* pointSize}px; transition: none">
        <div class="button"><img src="/rotate.svg" on:click={() =>rotateObject()}></div>
        <div class="button"><img src="/trash.svg"></div>
    </div>
{/if}
<style>
    canvas {
        position: relative;
        flex: 1;
    }

    #toolbar {
        position: absolute;
        display: flex;
        gap: .5em;
    }

    #toolbar > .button {
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: white;
        box-shadow: 0 0 5px 5px rgba(0, 0, 0, 0.05);
        border-radius: 5px;
    }

    .button img {
        width: 1em;
        height: 1em;
        padding: .5em;
    }

    #toolbar > .button:hover {
        transform: scale(1.1);
        cursor: pointer;
    }
</style>