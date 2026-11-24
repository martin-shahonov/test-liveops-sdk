import type { View } from "./view/View"
import type { Machine } from "./machine/Machine"
import { MachineStates } from "./machine/MachineStates"
import { MachineEvents } from "./machine/MachineEvents"
import { StateActionEvents } from "./machine/stateActions/StateActionEvents"
import type { Model } from "./Model"
import { createActor, type AnyActor } from "xstate"

export interface StateActionCompletion {
    fromState: MachineStates
    event?: MachineEvents
    [key: string]: unknown
}

export class Controller {
    protected _actor?: AnyActor

    constructor(
        protected _model: Model,
        protected _views: Record<string, View>,
        protected _machine: Machine
    ) {
        this.init()
    }

    start(): void {
        if (this.state === MachineStates.idle) {
            this.send(MachineEvents.continue)
        }
    }

    get state(): MachineStates | undefined {
        return this._actor?.getSnapshot().value as MachineStates | undefined
    }

    send(event: MachineEvents): void {
        this._actor?.send({ type: event })
    }

    destroy() {
        this.toggleListeners('off')
        this._actor?.stop()
        this._machine.destroy()
    }

    protected init() {
        this.launchActor()
        this.toggleListeners('on')
    }

    protected launchActor() {
        this._actor = createActor(this._machine.instance)
        this._actor.start()
    }

    protected toggleListeners(method: 'on' | 'off') {
        this._machine[method](StateActionEvents.complete, this.handleStateActionCompleted, this)
    }

    protected handleStateActionCompleted(args: StateActionCompletion) {
        this.send(args.event ?? MachineEvents.continue)
    }
}
