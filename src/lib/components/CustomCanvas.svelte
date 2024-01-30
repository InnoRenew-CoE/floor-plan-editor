<script lang="ts">
    import {onMount} from "svelte";
    import type {Point2D, Room} from "$lib/types/Graphics";

    export let debug: boolean = true

    const testRoom: Room = {
        quality: "good",
        points: [{x: 0, y: 0}, {x: 0, y: 5}, {x: 5, y: 5}, {x: 5, y: 0},
            {x: 5, y: 0}, {x: 10, y: 0}, {x: 10, y: -5}, {x: 0, y: -5}]
    }
    const secondTestRoom: Room = {
        quality: "bad",
        points: [{x: 0, y: -5}, {x: 20, y: -5}, {x: 20, y: -20}, {x: 0, y: -20}]
    }

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let windowHeight: number, windowWidth: number

    const minimumPointSize = 20
    let scale = 1.0;
    let pointSize = minimumPointSize
    let halfPointSize: number
    $: halfPointSize = pointSize / 2

    let centerPosition: Point2D = {x: 0, y: 0}
    let canvasOffset: Point2D = {x: 0, y: 0}
    let zoomPoint: Point2D = centerPosition
    let mousePosition: Point2D = centerPosition
    let moveStartPosition: Point2D = centerPosition

    function setCenter() {
        let clientWidth = canvas.clientWidth
        let clientHeight = canvas.clientHeight
        centerPosition = {x: clientWidth / 2, y: clientHeight / 2}
    }


    function move(event: MouseEvent) {
        mousePosition = {x: event.clientX, y: event.clientY}
        if (event.buttons == 1) { // Middle button = 1, Left = 0, Right = 2
            let distanceX = event.clientX - moveStartPosition.x
            let distanceY = event.clientY - moveStartPosition.y

            canvasOffset.x += distanceX
            canvasOffset.y += distanceY
            moveStartPosition = {...mousePosition}
        }
    }

    function redraw() {
        if (ctx) {
            ctx.clearRect(0, 0, 10000, 1000)
            setCenter()
            drawGrid()
            drawRoom(testRoom)
            drawRoom(secondTestRoom)

            if (debug) {
                const fakeCenter = transformRealToFake(centerPosition);
                const transformedMouseFake = transformRealToFake(mousePosition);
                const drawableCenter = transformFakeToDrawable(fakeCenter);
                ctx.strokeStyle = "black"
                ctx.lineWidth = 1
                ctx.strokeText(`Mouse: ${mousePosition.x}, ${mousePosition.y}`, 20, 20)
                ctx.strokeText(`Mouse: ${mousePosition.x - centerPosition.x}, ${centerPosition.y - mousePosition.y}`, 20, 40)
                ctx.strokeText(`Mouse: ${transformedMouseFake.x}, ${transformedMouseFake.y}`, 20, 60)
                ctx.strokeText(`Mouse: ${scale}x, ${pointSize}px`, 20, 80)
            }

            ctx.beginPath()
            ctx.moveTo(0, 0)
            ctx.lineTo(100, 100);
            ctx.closePath();
            ctx.stroke()

            ctx.strokeStyle = "blue"
            const mouseGridCoordinates: Point2D = transformRealToFake(mousePosition)
            const drawableMouseCoordinates = transformFakeToDrawable(mouseGridCoordinates)

            const transformedX = mousePosition.x - centerPosition.x
            const transformedY = centerPosition.y - mousePosition.y
            ctx.strokeText(`C: ${Math.round(canvasOffset.x)}px, ${Math.round(canvasOffset.y)}px`, mousePosition.x, mousePosition.y + 70)
            ctx.strokeText(`A: ${mouseGridCoordinates.x}, ${mouseGridCoordinates.y}`, mousePosition.x, mousePosition.y + 60)
            ctx.strokeText(`T: ${transformedX}, ${transformedY}`, mousePosition.x, mousePosition.y + 50)
            ctx.strokeText(`R: ${mousePosition.x}, ${mousePosition.y}`, mousePosition.x, mousePosition.y + 40)

            ctx.fillStyle = "rgba(150, 30, 20, .1)"
            ctx.beginPath()
            ctx.fillRect(drawableMouseCoordinates.x, drawableMouseCoordinates.y, pointSize, pointSize)
            ctx.closePath()
            ctx.fill()
        }
    }

    function zoom(e: WheelEvent) {
        const distanceCenterX = centerPosition.x - mousePosition.x
        const delta = e.deltaY
        scale += delta / 100
        scale = Math.max(0.5, Math.min(5, scale));
        pointSize = minimumPointSize * scale;
        canvasOffset.x += distanceCenterX / 10 * Math.sign(delta);
    }

    function drawGrid() {
        const numberOfColumns = windowWidth / pointSize
        const numberOfRows = windowHeight / pointSize
        const lineWidth = pointSize / 100;
        ctx.lineWidth = lineWidth
        ctx.strokeStyle = `rgba(0,0,0, ${scale / 10})`;
        //ctx.strokeStyle = `rgba(0,0,0, 0)`;
        for (let i = -windowHeight; i < windowWidth; i++) {
            ctx.beginPath()
            const x = i * pointSize + canvasOffset.x + halfPointSize - lineWidth / 2
            ctx.strokeText(`${i}`, x - pointSize * 5 / 8, 50)
            ctx.moveTo(x, 0);
            ctx.lineTo(x, windowHeight);
            ctx.closePath()
            ctx.stroke()
        }
        for (let i = -windowWidth; i < windowHeight; i++) {
            const y = -i * pointSize + canvasOffset.y - halfPointSize + lineWidth / 2
            ctx.strokeText(`${i}`, 50, y + pointSize * 5 / 8)
            ctx.beginPath()
            ctx.moveTo(0, y);
            ctx.lineTo(windowWidth, y);
            ctx.closePath()
            ctx.stroke()
        }

    }

    const transformFakeToDrawable = (point: Point2D) => {
        return {x: (point.x * pointSize + canvasOffset.x - halfPointSize), y: (-point.y * pointSize + canvasOffset.y) - halfPointSize}
    }

    const transformRealToFake = (point: Point2D) => {
        const absolutePosition = {x: point.x - canvasOffset.x, y: canvasOffset.y - point.y}
        return {x: Math.round(absolutePosition.x / pointSize), y: Math.round(absolutePosition.y / pointSize)}
    }

    onMount(async () => {
        dpiFix()
        canvasOffset = centerPosition
    })

    $: if (windowHeight) dpiFix()
    $: if (windowWidth) dpiFix()
    $: if (mousePosition) redraw()
    $: if (pointSize) redraw()

    function drawRoom(room: Room) {
        ctx.lineWidth = pointSize
        ctx.strokeStyle = "black"
        ctx.beginPath()
        const firstPoint = transformFakeToDrawable(room.points[0]);
        let lastPoint: Point2D | undefined = undefined
        for (let i = 0; i < room.points.length; i++) {
            const previousPoint = room.points[i - 1];
            const nextPoint = room.points[i + 1];
            let transformedCurrent = transformFakeToDrawable(room.points[i])
            transformedCurrent = {...transformedCurrent, x: transformedCurrent.x + halfPointSize, y: transformedCurrent.y + halfPointSize}
            if (!previousPoint) {
                ctx.beginPath()
                ctx.moveTo(transformedCurrent.x, transformedCurrent.y)
            } else {
                const transformedPrevious = transformFakeToDrawable(previousPoint)
                ctx.lineTo(transformedCurrent.x, transformedCurrent.y)
                if (!nextPoint) {
                    ctx.lineTo(transformedCurrent.x, transformedCurrent.y)
                    lastPoint = transformedCurrent
                    ctx.closePath()
                }
            }
        }
        const grd = ctx.createLinearGradient(firstPoint.x, lastPoint!.y, lastPoint!.x, firstPoint.y)
        if (room.quality === "good") {
            grd.addColorStop(0, "rgba(30, 255, 150, 1)");
            grd.addColorStop(1, "rgba(30, 200, 100, 1)");
        } else {
            grd.addColorStop(0, "rgb(218,26,26)");
            grd.addColorStop(1, "rgb(200,100,127)");
        }
        ctx.fillStyle = grd
        ctx.save();
        ctx.clip();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        ctx.lineWidth *= 1
        ctx.stroke()

    }

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
        setCenter()
        redraw()
    }

</script>
<svelte:window bind:innerHeight={windowHeight} bind:innerWidth={windowWidth}/>

<canvas
        bind:this={canvas}
        on:mousedown={e => (moveStartPosition = {x: e.clientX, y: e.clientY})}
        on:mouseenter={e => (moveStartPosition = {x: e.clientX, y: e.clientY})}
        on:mousemove={move}
/>
<style>
    canvas {
        flex: 1;
    }
</style>