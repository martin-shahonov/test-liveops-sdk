import type { Model } from "../../Model.js"
import { StateAction } from "./StateAction.js"
import type { View } from "../../view/View.js"
import { MachineStates } from "../MachineStates.js"
import { MachineEvents } from "../MachineEvents.js"

export abstract class CompleteStateAction extends StateAction {
    constructor(model: Model, views: Record<string, View>) {
        super(model, views, MachineStates.complete)
    }

    override next() {
        return {
            [MachineEvents.continue]: {
                target: MachineStates.awaitingDecision
            },
            [MachineEvents.loop]: {
                target: MachineStates.ready
            },
            [MachineEvents.end]: {
                target: MachineStates.completed
            }
        }
    }
}
