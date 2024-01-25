<script lang="ts">
    import {onMount} from "svelte";
    import type {Point2D} from "$lib/types/Graphics";

    export let debug: boolean = true

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let windowHeight: number, windowWidth: number

    let scale = 1.0;
    let pointSize = 10.0
    let centerPosition: Point2D = {x: 0, y: 0}
    let mousePosition: Point2D = centerPosition
    let moveStartPosition: Point2D = centerPosition


    function dpiFix() {
        ctx = canvas.getContext("2d")
        const width = windowWidth
        const height = windowHeight
        const ratio = Math.ceil(window.devicePixelRatio);
        console.log(width, height, ratio)
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(ratio, ratio)
        centerPosition = {x: canvas.clientWidth / 2, y: canvas.clientHeight / 2}
        redraw()
    }

    function move(event: MouseEvent) {
        mousePosition = {x: event.clientX, y: event.clientY}
        if (event.button == 1) { // Middle button
            let distanceX = event.clientX - moveStartPosition.x
            let distanceY = event.clientY - moveStartPosition.y
        }
    }

    onMount(async () => {
        dpiFix()
    })

    function redraw() {
        if (ctx) {
            ctx.clearRect(0, 0, 10000, 1000)
            drawGrid()
            if (debug) {
                ctx.strokeStyle = "black"
                ctx.strokeText(`Mouse: ${mousePosition.x}, ${mousePosition.y}`, 20, 20)
                ctx.strokeText(`Mouse: ${mousePosition.x - centerPosition.x}, ${centerPosition.y - mousePosition.y}`, 20, 40)
                ctx.beginPath()
                ctx.fillRect(centerPosition.x, centerPosition.y, pointSize, pointSize)
                ctx.fill();
                ctx.closePath()
            }

            ctx.beginPath()
            ctx.moveTo(0, 0)
            ctx.lineTo(100, 100);
            ctx.closePath();
            ctx.stroke()

            const transformed = transformRealToFake(mousePosition);
            const drawable = transformFakeToDrawable(transformed);
            console.log(transformed, drawable)
            ctx.beginPath()
            ctx.fillRect(drawable.x, drawable.y, pointSize, pointSize)
            ctx.fill();
            ctx.closePath()
        }
    }

    function zoom(e: WheelEvent) {
        const delta = e.deltaY
        scale += delta / 10
        scale = Math.max(1, Math.min(5, scale));
        pointSize = 5 * scale;
        redraw()
    }

    function drawGrid() {
        const numberOfColumns = windowWidth / pointSize
        const numberOfRows = windowHeight / pointSize
        ctx.lineWidth = pointSize / 10
        ctx.strokeStyle = `rgba(0,0,0, ${scale / 10}`;
        for (let i = 0; i < numberOfColumns; i++) {
            ctx.beginPath()
            const x = i * pointSize
            ctx.moveTo(x, 0);
            ctx.lineTo(x, windowHeight);
            ctx.closePath()
            ctx.stroke()
        }
        for (let i = 0; i < numberOfRows; i++) {
            const y = i * pointSize
            ctx.beginPath()
            ctx.moveTo(0, y);
            ctx.lineTo(windowWidth, y);
            ctx.closePath()
            ctx.stroke()
        }
    }

    const transformFakeToDrawable = (point: Point2D) => {
        const transformedX = point.x * pointSize
        const transformedY = point.y * pointSize
        const closestGridX = Math.ceil(transformedX / pointSize) * pointSize
        const closestGridY = Math.ceil(transformedY / pointSize) * pointSize
        return {x: centerPosition.x + closestGridX, y: centerPosition.y - closestGridY}
    }

    const transformRealToFake = (point: Point2D) => {
        const transformedX = point.x - centerPosition.x
        const transformedY = centerPosition.y - point.y
        const closestGridX = Math.floor(transformedX / pointSize)
        const closestGridY = Math.floor(transformedY / pointSize)
        return {x: closestGridX, y: closestGridY + 1}
    }

    $: if (windowHeight) dpiFix()
    $: if (windowWidth) dpiFix()
    $: if (mousePosition) redraw()

</script>
<svelte:window bind:innerHeight={windowHeight} bind:innerWidth={windowWidth}/>

<canvas
        bind:this={canvas}
        on:mousedown={e => (moveStartPosition = {x: e.clientX, y: e.clientY})}
        on:mousemove={move}
        on:wheel={zoom}

        style="background-color: orange"
/>
<style>
    canvas {
        flex: 1;
    }
</style>