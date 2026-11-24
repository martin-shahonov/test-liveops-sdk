import { EventEmitter } from 'pixi.js'

export enum LifecycleEvents {
    /** The game is out of sight (its page hidden, or the host said so): stop drawing and playing. */
    pause = 'pause',
    resume = 'resume',
}

/**
 * The running game's lifecycle, for what the ticker does not drive (a video, a timer, a sound),
 * so it can stop with the game. `Game` emits; anything listens.
 */
export const lifecycle = new EventEmitter<LifecycleEvents>()
