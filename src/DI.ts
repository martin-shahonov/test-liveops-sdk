import Bottle from 'bottlejs'

import { Controller } from './Controller.js'

import { Model } from './Model.js'
import { View } from './view/View.js'
import { GameAssets } from './GameAssets.js'
import { ViewConfig } from './view/ViewConfig.js'
import type { ViewAssets } from './view/ViewAssets.js'

import { Machine } from './machine/Machine.js'
import { MachineStates } from './machine/MachineStates.js'
import type { StateAction } from './machine/stateActions/StateAction.js'
import { IdleStateAction } from './machine/stateActions/1_IdleStateAction.js'
import { InitStateAction } from './machine/stateActions/2_InitStateAction.js'
import { ReadyStateAction } from './machine/stateActions/3_ReadyStateAction.js'
import { StartingStateAction } from './machine/stateActions/4_StartingStateAction.js'
import { ResolvingStateAction } from './machine/stateActions/5_ResolvingStateAction.js'
import { PresentingStateAction } from './machine/stateActions/6_PresentingStateAction.js'
import { AwaitingDecisionStateAction } from './machine/stateActions/8_AwaitingDecisionStateActor.js'
import { CompleteStateAction } from './machine/stateActions/7_CompleteStateAction.js'
import { CompletedStateAction } from './machine/stateActions/9_CompletedStateAction.js'
import { FailureStateAction } from './machine/stateActions/10_FailureStateAction.js'

export interface ViewDefinition {
    name: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- a view takes its own ViewConfig subclass
    view: new (config: any, assets: ViewAssets) => View<any>
    assets: ViewAssets
    config?: ViewConfig
}

export interface DIConfig {
    views: readonly ViewDefinition[]
}

export class DI {
    protected readonly _bottle = new Bottle()

    constructor(protected _config: DIConfig) { }

    protected get gameAssets(): GameAssets {
        return this._bottle.container.gameAssets
    }

    protected get views(): Record<string, View> {
        return this._bottle.container.views
    }

    protected get controller(): Controller {
        return this._bottle.container.controller
    }

    launch() {
        this._bottle.constant('config', this._config)

        this.registerModelCtor()
        this.registerModel()
        this.registerViews()
        this.registerStateActionsCtors()
        this.registerStateActions()
        this.registerStateMachine()
        this.registerControllerCtor()
        this.registerController()

        return {
            controller: this.controller,
            views: Object.values(this.views),
            gameAssets: this.gameAssets
        }
    }

    protected registerModelCtor() {
        this._bottle.value('modelCtor', Model)
    }

    protected registerModel() {
        this._bottle.factory('model', (container: Bottle.IContainer) => new container.modelCtor())
    }

    protected registerViews() {
        this._bottle.factory('gameAssets', () => new GameAssets(this._config.views.map((definition) => definition.assets)))
        this._bottle.factory('views', () => {
            const views: Record<string, View> = {}

            for (const { name, view, assets, config: viewConfig } of this._config.views) {
                if (views[name]) {
                    throw new Error(`View "${name}" is defined more than once`)
                }

                views[name] = new view(viewConfig ?? new ViewConfig(), assets)
            }

            return views
        })
    }

    protected registerStateActionsCtors() {
        this._bottle.value('idleStateActionCtor', IdleStateAction)
        this._bottle.value('initStateActionCtor', InitStateAction)
        this._bottle.value('readyStateActionCtor', ReadyStateAction)
        this._bottle.value('startingStateActionCtor', StartingStateAction)
        this._bottle.value('resolvingStateActionCtor', ResolvingStateAction)
        this._bottle.value('presentingStateActionCtor', PresentingStateAction)
        this._bottle.value('awaitingDecisionStateActionCtor', AwaitingDecisionStateAction)
        this._bottle.value('completeStateActionCtor', CompleteStateAction)
        this._bottle.value('completedStateActionCtor', CompletedStateAction)
        this._bottle.value('failureStateActionCtor', FailureStateAction)
    }

    protected registerStateActions() {
        this._bottle.factory('idleStateAction', (container: Bottle.IContainer) => {
            return new container.idleStateActionCtor(container.model, container.views)
        })
        this._bottle.factory('initStateAction', (container: Bottle.IContainer) => {
            return new container.initStateActionCtor(container.model, container.views)
        })
        this._bottle.factory('readyStateAction', (container: Bottle.IContainer) => {
            return new container.readyStateActionCtor(container.model, container.views)
        })
        this._bottle.factory('startingStateAction', (container: Bottle.IContainer) => {
            return new container.startingStateActionCtor(container.model, container.views)
        })
        this._bottle.factory('resolvingStateAction', (container: Bottle.IContainer) => {
            return new container.resolvingStateActionCtor(container.model, container.views)
        })
        this._bottle.factory('presentingStateAction', (container: Bottle.IContainer) => {
            return new container.presentingStateActionCtor(container.model, container.views)
        })
        this._bottle.factory('awaitingDecisionStateAction', (container: Bottle.IContainer) => {
            return new container.awaitingDecisionStateActionCtor(container.model, container.views)
        })
        this._bottle.factory('completeStateAction', (container: Bottle.IContainer) => {
            return new container.completeStateActionCtor(container.model, container.views)
        })
        this._bottle.factory('completedStateAction', (container: Bottle.IContainer) => {
            return new container.completedStateActionCtor(container.model, container.views)
        })
        this._bottle.factory('failureStateAction', (container: Bottle.IContainer) => {
            return new container.failureStateActionCtor(container.model, container.views)
        })
    }

    protected registerStateMachine() {
        this._bottle.factory('machine', (container: Bottle.IContainer) => {
            return new Machine({
                [MachineStates.idle]: container.idleStateAction as StateAction,
                [MachineStates.init]: container.initStateAction as StateAction,
                [MachineStates.ready]: container.readyStateAction as StateAction,
                [MachineStates.starting]: container.startingStateAction as StateAction,
                [MachineStates.resolving]: container.resolvingStateAction as StateAction,
                [MachineStates.presenting]: container.presentingStateAction as StateAction,
                [MachineStates.awaitingDecision]: container.awaitingDecisionStateAction as StateAction,
                [MachineStates.complete]: container.completeStateAction as StateAction,
                [MachineStates.completed]: container.completedStateAction as StateAction,
                [MachineStates.failure]: container.failureStateAction as StateAction,
            })
        })
    }

    protected registerControllerCtor() {
        this._bottle.value('controllerCtor', Controller)
    }

    protected registerController() {
        this._bottle.factory('controller', (container: Bottle.IContainer) => {
            return new container.controllerCtor(
                container.model,
                container.views,
                container.machine
            )
        })
    }
}
