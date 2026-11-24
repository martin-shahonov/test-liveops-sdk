import type { Model } from "../../Model"
import type { View } from "../../view/View"
import { MachineEvents } from "../MachineEvents"
import { MachineStates } from "../MachineStates"
import { StateAction } from "./StateAction"

export abstract class InitStateAction extends StateAction {
    constructor(model: Model, views: Record<string, View>) {
        super(model, views, MachineStates.init)
    }

    override next() {
        return {
            [MachineEvents.continue]: {
                target: MachineStates.ready
            }
        }
    }
}