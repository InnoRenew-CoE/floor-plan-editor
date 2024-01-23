<script lang="ts">
    import {onMount} from "svelte";

    let canvas: HTMLCanvasElement
    let ctx: CanvasRenderingContext2D;

    let scale = 1.0;
    let pointSize = 10.0
    let centerPoint: { x: number, y: number } = {x: 0, y: 0}

    function drawGrid() {
        let gridSize = pointSize;
        let gridCountWidth = canvas.width / gridSize;
        let gridCountHeight = canvas.height / gridSize;
        ctx.strokeStyle = "rgba(0,0,0, 0.15)"
        ctx.lineWidth = 0.1 * scale
        for (let i = 0; i < gridCountWidth; i++) {
            ctx.beginPath();
            ctx.moveTo(i * gridSize, 0);
            ctx.lineTo(i * gridSize, canvas.height);
            ctx.closePath()
            ctx.stroke()
        }
        for (let i = 0; i < gridCountHeight; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * gridSize);
            ctx.lineTo(canvas.width, i * gridSize);
            ctx.closePath()
            ctx.stroke()
        }
    }


    function dpiFix() {
        canvas.width = +getComputedStyle(canvas).getPropertyValue("width").slice(0, -2)
        canvas.height = +getComputedStyle(canvas).getPropertyValue("height").slice(0, -2);
    }

    function zoom(e: WheelEvent) {
        let {x, y} = getNearestPosition(canvas.width / 2, canvas.height / 2)
        let distanceFromCenterPointX = Math.abs(e.clientX - x);
        let distanceFromCenterPointY = Math.abs(e.clientY - y);

        let multiplier = e.deltaY < 0 ? -1 : 1
        scale += e.deltaY / e.deltaY / 10 * multiplier;
        scale = Math.max(1, Math.min(5, scale));
        pointSize = 5 * scale;

        clearContext()
        drawGrid()
        drawTestRoom()
    }

    onMount(async () => {
        ctx = canvas.getContext("2d")
        dpiFix()
        let centerX = canvas.width / 2
        let centerY = canvas.height / 2
        let {x, y} = getNearestPosition(centerX, centerY)
        centerPoint = {x: x, y: y}

        drawGrid()
        drawTestRoom()
    })

    function clearContext() {
        ctx.clearRect(0, 0, canvas.width * 2, canvas.height * 2);
    }

    function drawTestRoom() {
        let {x, y} = getNearestPosition(centerPoint.x, centerPoint.y)
        ctx.strokeStyle = "orange"
        ctx.lineWidth = pointSize
        let size = 10 * pointSize;
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + size, y)
        ctx.lineTo(x + size, y + size)
        ctx.lineTo(x, y + size)
        ctx.lineTo(x, y)
        ctx.closePath()
        ctx.stroke()
    }

    function getNearestPosition(x: number, y: number) {
        let half = pointSize * 0
        return {x: Math.floor(x / pointSize) * pointSize - half, y: Math.floor(y / pointSize) * pointSize - half}
    }

    let moveStartPosition: { x: number, y: number } = {x: 0, y: 0}

    function middleDown(e: MouseEvent) {
        if (e.button == 1) {
            moveStartPosition = {x: e.clientX, y: e.clientY}
        }
    }

    function move(e: MouseEvent) {
        if (e.button == 1) {
            let distanceX = e.clientX - moveStartPosition.x;
            let distanceY = e.clientY - moveStartPosition.y;
            centerPoint.x += distanceX;
            centerPoint.y += distanceY;
            moveStartPosition = {x: e.clientX, y: e.clientY}
        }
        clearContext()
        drawGrid()
        drawTestRoom()
    }
</script>

<div id="container">
    <canvas
            bind:this={canvas}
            on:mousedown={middleDown}
            on:mousemove={move}
            on:resize={dpiFix}
            on:wheel={zoom}
    />
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