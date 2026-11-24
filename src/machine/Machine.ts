import { createMachine, type AnyStateMachine } from 'xstate'

import { MachineStates } from './MachineStates.js'
import { MachineContext } from './MachineContext.js'
import { type StateAction } from './stateActions/StateAction.js'
import { StateActionEvents } from './stateActions/StateActionEvents.js'
import { MachineEvents } from './MachineEvents.js'
import { EventEmitter } from 'pixi.js'

export type MachineActions = Record<MachineStates, StateAction>

export class Machine extends EventEmitter {
    protected _machine: AnyStateMachine

    constructor(protected _actions: MachineActions) {
        super()

        this._machine = this.init()

        this.logDefinition()
        this.toggleListeners('on')
    }

    get instance() {
        return this._machine
    }

    /** Logs the machine as `createMachine(...)` code, to copy-paste into the Stately visualizer (https://stately.ai/viz). */
    logDefinition(): void {
        console.log(`const machine = createMachine(${JSON.stringify(this._machine.config, null, 2)})`)
    }

    destroy() {
        this.toggleListeners('off')
    }

    protected init() {
        return createMachine({
            id: 'gameMachine',
            context: new MachineContext(),
            initial: MachineStates.idle,
            // Any state can give up: a state action completes with `{ event: MachineEvents.fail }`.
            on: {
                [MachineEvents.fail]: { target: `.${MachineStates.failure}` }
            },
            states: {
                [MachineStates.idle]: this._actions.idle.getProps(),
                [MachineStates.init]: this._actions.init.getProps(),
                [MachineStates.ready]: this._actions.ready.getProps(),
                [MachineStates.starting]: this._actions.starting.getProps(),
                [MachineStates.resolving]: this._actions.resolving.getProps(),
                [MachineStates.presenting]: this._actions.presenting.getProps(),
                [MachineStates.awaitingDecision]: this._actions.awaitingDecision.getProps(),
                [MachineStates.complete]: this._actions.complete.getProps(),
                [MachineStates.completed]: this._actions.completed.getProps(),
                [MachineStates.failure]: this._actions.failure.getProps(),
            }
        })
    }

    protected toggleListeners(method: 'on' | 'off') {
        const actions = Object.values(this._actions)

        for (const action of actions) {
            action[method](StateActionEvents.complete, this.handleStateActionCompleted, this)
        }
    }

    protected handleStateActionCompleted(args: any) {
        this.emit(StateActionEvents.complete, args)
    }
}
