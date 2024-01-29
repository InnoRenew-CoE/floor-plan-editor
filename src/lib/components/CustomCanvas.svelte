<script lang="ts">
    import {onMount} from "svelte";
    import type {Point2D, Room} from "$lib/types/Graphics";

    export let debug: boolean = true

    const testRoom: Room = {
        points: [{x: 0, y: 0}, {x: 0, y: 5}, {x: 5, y: 5}, {x: 5, y: 0}]
    }

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let windowHeight: number, windowWidth: number

    const minimumPointSize = 50
    let scale = 5.0;
    let pointSize = minimumPointSize
    let halfPointSize: number
    $: halfPointSize = pointSize / 2

    let centerPosition: Point2D = {x: 0, y: 0}
    let canvasOffset: Point2D = {x: 0, y: 0}
    let mousePosition: Point2D = centerPosition
    let moveStartPosition: Point2D = centerPosition

    function setCenter(){
        let clientWidth = canvas.clientWidth
        let clientHeight = canvas.clientHeight
        centerPosition = {x: clientWidth / 2, y: clientHeight / 2}
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

    function move(event: MouseEvent) {
        mousePosition = {x: event.pageX, y: event.pageY}
        if (event.button == 1) { // Middle button
            let distanceX = event.clientX - moveStartPosition.x
            let distanceY = event.clientY - moveStartPosition.y
        }
    }

    function redraw() {
        if (ctx) {
            ctx.clearRect(0, 0, 10000, 1000)
            setCenter()
            drawGrid()
            drawRoom(testRoom)

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
                ctx.beginPath()
                ctx.fillStyle = "pink"
                ctx.arc(centerPosition.x, centerPosition.y, pointSize / 2, 0, 360)
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
            ctx.fillStyle = "orange"
            ctx.beginPath()
            ctx.arc(mousePosition.x, mousePosition.y, pointSize / 20, 0, 360)
            ctx.fill();
            ctx.closePath()

            ctx.fillStyle = "indigo"
            ctx.beginPath()
            ctx.arc(drawable.x, drawable.y, pointSize / 10, 0, 360)
            ctx.fill();
            ctx.closePath()

            ctx.strokeStyle = "blue"
            const transformedX = mousePosition.x - centerPosition.x
            const transformedY = centerPosition.y - mousePosition.y
            ctx.strokeText(`R: ${transformedX}, ${transformedY}`, mousePosition.x, mousePosition.y - 110)
            ctx.strokeText(`R: ${mousePosition.x}, ${mousePosition.y}`, mousePosition.x, mousePosition.y - 90)
            ctx.strokeText(`T: ${transformed.x}, ${transformed.y}`, mousePosition.x, mousePosition.y -70)
            ctx.strokeText(`D: ${drawable.x}, ${drawable.y}`, mousePosition.x, mousePosition.y - 50)
        }
    }

    function zoom(e: WheelEvent) {
        const delta = e.deltaY
        scale += delta / 50
        scale = Math.max(0.5, Math.min(5, scale));
        pointSize = minimumPointSize * scale;
    }

    function drawGrid() {
        const numberOfColumns = windowWidth / pointSize
        const numberOfRows = windowHeight / pointSize
        const lineWidth = pointSize / 100;
        ctx.lineWidth = lineWidth
        ctx.strokeStyle = `rgba(0,0,0, ${scale / 30}`;
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
        const closestGridX = centerPosition.x + transformedX
        const closestGridY = centerPosition.y - transformedY
        return {x: Math.floor(closestGridX / pointSize) * pointSize, y: Math.round(closestGridY / pointSize) * pointSize}
    }

    const transformRealToFake = (point: Point2D) => {
        const transformedX = point.x - centerPosition.x
        const transformedY = centerPosition.y - point.y
        const closestGridX = Math.round(transformedX / pointSize)
        const closestGridY = Math.round(transformedY / pointSize)
        return {x: closestGridX, y: closestGridY}
    }

    onMount(async () => {
        dpiFix()
    })

    $: if (windowHeight) dpiFix()
    $: if (windowWidth) dpiFix()
    $: if (mousePosition) redraw()
    $: if (pointSize) redraw()

    function drawRoom(room: Room) {
        ctx.lineWidth = pointSize
        ctx.strokeStyle = "black"
        ctx.beginPath()
        const firstPoint = room.points[0]
        const updatedFirstPoint = {...firstPoint, y: firstPoint.y}
        const transformedFirstPoint = transformFakeToDrawable(updatedFirstPoint)
        ctx.moveTo(transformedFirstPoint.x, transformedFirstPoint.y)
        room.points.reduce((previous, next) => {
            const updatedLastPoint = {...next, x: next.x}
            const transformedLastPoint = transformFakeToDrawable(updatedLastPoint)
            ctx.lineTo(transformedLastPoint.x, transformedLastPoint.y)
            return next
        }, updatedFirstPoint)
        ctx.moveTo(transformedFirstPoint.x, transformedFirstPoint.y)
        ctx.closePath()
        ctx.stroke()
    }

</script>
<svelte:window bind:innerHeight={windowHeight} bind:innerWidth={windowWidth}/>

<canvas
        bind:this={canvas}
        on:mousedown={e => (moveStartPosition = {x: e.clientX, y: e.clientY})}
        on:mousemove={move}
        on:wheel={zoom}

        style="background-color: rgba(255,165,0,0.24)"
/>
<style>
    canvas {
        flex: 1;
    }
</style>