<script lang="ts">
    import {Renderer} from "$lib/types/Renderer"
    import {currentRoom, currentState, type Point2D, roomStore, State} from "$lib/types/Graphics";
    import Toolbar from "$lib/components/Toolbar.svelte";
    import RoomToolbar from "$lib/components/RoomToolbar.svelte";

    let canvas: HTMLCanvasElement;
    let svg: SVGElement;
    let windowHeight: number, windowWidth: number
    let moveStartPosition: Point2D;
    let isMouseDown: boolean;
    let mousePosition: Point2D;
    const renderer = new Renderer();

    $: renderer.setRooms($roomStore)
    $: if (windowWidth || windowHeight) {
        renderer.setup(canvas, "/clean.svg", windowWidth, windowHeight);
    }

    function onMove(e: MouseEvent) {
        mousePosition = {x: e.clientX, y: e.clientY}
        renderer.redraw()
        const context = canvas.getContext("2d")
        const fake = renderer.realToFake(mousePosition)
        const real = renderer.fakeToReal(fake);
        if (e.button == 1 || 1 == e.button & 2) { // Middle button = 1, Left = 0, Right = 2
            let distanceX = e.clientX - moveStartPosition.x
            let distanceY = e.clientY - moveStartPosition.y
            renderer.centerPoint.x += distanceX
            renderer.centerPoint.y += distanceY
            moveStartPosition = {...mousePosition}
        }

        const room = $currentRoom;
        if (room) {
            context.beginPath();
            context.strokeStyle = "red";
            const start = room.lines[0]?.start;
            for (let i = 0; i < room.lines.length; i++) {
                const line = room.lines[i];
                const realStart = renderer.fakeToReal(line.start)
                const realEnd = line.end ? renderer.fakeToReal(line.end) : mousePosition;
                if (i === 0) {
                    context.moveTo(realStart.x, realStart.y);
                }
                context.lineTo(realEnd.x, realEnd.y);
            }
            context.closePath()
            context.stroke()
        }

    }

    function zoom(e: WheelEvent) {
        const scaleChange = e.deltaY / 50;
        const newScale = renderer.scale + scaleChange;
        renderer.setScale(newScale);
        renderer.redraw();
    }

    function mouseDown(e: MouseEvent) {
        mousePosition = {x: e.clientX, y: e.clientY};
        moveStartPosition = {x: e.clientX, y: e.clientY}
        const fakePosition = renderer.realToFake(moveStartPosition);
        isMouseDown = e.button === 0;
        if (isMouseDown && $currentState === State.Drawing) {
            let room = $currentRoom;
            if (!room) {
                room = {lines: [], name: "Unknown", quality: 0}
                $currentRoom = room;
            }
            const firstLine = room.lines[0];
            let lastLine = room.lines[room.lines.length - 1];
            if (!lastLine) {
                room.lines.push({start: fakePosition, end: undefined})
            } else {
                lastLine.end = fakePosition
                room.lines.push(lastLine);
                if (firstLine && JSON.stringify(firstLine.start) !== JSON.stringify(lastLine.end)) {
                    room.lines.push({start: fakePosition, end: undefined})
                } else {
                    $roomStore.push(room);
                    $currentRoom = undefined;
                }
            }
        }

        if (isMouseDown && $currentState === State.Idle) {
            $currentRoom = renderer.findRoomUnderMouse(mousePosition);
            renderer.redraw()
        }
    }
</script>

<svelte:window bind:innerHeight={windowHeight} bind:innerWidth={windowWidth}/>
<div style="position: relative; overflow: hidden">
    <canvas bind:this={canvas}
            on:mousedown={mouseDown}
            on:mousemove={onMove}
            on:mouseup={() => isMouseDown = false}
            on:wheel={zoom}/>
    <Toolbar/>
    {#if $currentState === State.Idle && $currentRoom}
        <RoomToolbar bind:room={$currentRoom} {renderer}/>
    {/if}
</div>
<style>
    canvas {
        background-color: rgba(111, 135, 255, 0.31);
    }
</style>