import type {Writable} from "svelte/store";
import {writable} from "svelte/store";

export type Point2D = {
    x: number,
    y: number
}

export type Room = CanvasElement & {
    lines: Line[],
    quality: number,
}

export type CanvasElement = {
    position: Point2D,
    rotation: Number,
    type: CanvasElementType
}

export type Door = CanvasElement
export type Window = CanvasElement

export type Line = {
    start: Point2D,
    end: Point2D,
    // type: string
}

export const currentActionState: Writable<ActionState> = writable(ActionState.None)
export const currentlySelectedObject: Writable<CanvasElement | undefined> = writable();
export const currentLinesStore: Writable<Line[]> = writable([]);

export enum ActionState {
    Drawing = "Drawing",
    None = "None",
}

export enum GridPosition {
    Left, Right, Center, Top, Bottom
}

export enum CanvasElementType {
    Door = "Door",
    Window = "Window",
    Room = "Room"
}