import type {Writable} from "svelte/store";
import {writable} from "svelte/store";

export type Point2D = {
    x: number,
    y: number
}
export type Room = {
    lines: Line[],
    quality: number,
    name: string
}

export type Line = {
    start: Point2D,
    end: Point2D | undefined,
    // type: string
}


export enum GridPosition {
    Center, Right, Left, Top, Bottom
}

export enum State {
    Idle = "Idle", Drawing = "Drawing"
}

export const roomStore: Writable<Room[]> = writable([]);
export const currentRoom: Writable<Room | undefined> = writable();
export const currentState: Writable<State> = writable(State.Idle)
// export const currentLine: Writable<Line | undefined> = writable();