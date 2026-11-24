import { EventEmitter } from 'pixi.js'

import type { Model } from '../../Model.js'
import type { View } from '../../view/View.js'
import { MachineStates } from '../MachineStates.js'
import type { MachineEvents } from '../MachineEvents.js'
import { StateActionEvents } from './StateActionEvents.js'

export abstract class StateAction extends EventEmitter {
    constructor(
        protected _model: Model,
        protected _views: Record<string, View>,
        protected _state: MachineStates,
    ) {
        super()
    }

    getProps() {
        return {
            on: this.next(),
            entry: () => this.onEnter(),
            exit: () => this.onExit()
        }
    }

    abstract next(): Partial<Record<MachineEvents, { target: MachineStates }>>
    protected onEnter(): void { }

    protected complete(args?: any) {
        this.emit(StateActionEvents.complete, {
            fromState: this._state,
            ...args
        })
    }

    protected onExit() { }
}
