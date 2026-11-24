import type { Model } from "../../Model"
import { StateAction } from "./StateAction"
import type { View } from "../../view/View"
import { MachineStates } from "../MachineStates"
import { MachineEvents } from "../MachineEvents"

export abstract class PresentingStateAction extends StateAction {
    constructor(model: Model, views: Record<string, View>) {
        super(model, views, MachineStates.presenting)
    }

    override next() {
        return {
            [MachineEvents.continue]: {
                target: MachineStates.complete
            }
        }
    }
}