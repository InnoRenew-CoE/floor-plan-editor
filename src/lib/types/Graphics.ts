import type {Writable} from "svelte/store";
import {writable} from "svelte/store";

export type Point2D = {
    x: number,
    y: number
}

export type Room = {
    lines: Line[],
    quality: string
}

export type Line = {
    start: Point2D,
    end: Point2D,
    // type: string
}

export const currentActionState: Writable<ActionState> = writable(ActionState.None)
export const currentRoomStore: Writable<Room | undefined> = writable();
export const currentLinesStore: Writable<Line[]> = writable([]);

export enum ActionState {
    Drawing = "Drawing",
    None = "None",
}

export enum GridPosition {
    Left, Right, Center, Top, Bottom
}