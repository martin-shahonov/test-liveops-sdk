import type { Model } from "../../Model.js"
import { StateAction } from "./StateAction.js"
import type { View } from "../../view/View.js"
import { MachineStates } from "../MachineStates.js"
import { MachineEvents } from "../MachineEvents.js"

export abstract class AwaitingDecisionStateAction extends StateAction {
    constructor(model: Model, views: Record<string, View>) {
        super(model, views, MachineStates.awaitingDecision)
    }

    override next() {
        return {
            [MachineEvents.end]: {
                target: MachineStates.completed
            },
            [MachineEvents.loop]: {
                target: MachineStates.ready
            }
        }
    }
}
