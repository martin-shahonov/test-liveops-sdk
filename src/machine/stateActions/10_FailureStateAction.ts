import type { Model } from "../../Model"
import { StateAction } from "./StateAction"
import type { View } from "../../view/View"
import { MachineStates } from "../MachineStates"
import type { MachineEvents } from "../MachineEvents"

export abstract class FailureStateAction extends StateAction {
    constructor(model: Model, views: Record<string, View>) {
        super(model, views, MachineStates.failure)
    }

    override getProps(): {
        on: Partial<Record<MachineEvents, { target: MachineStates }>>;
        entry: () => void;
        exit: () => void,
        type?: string
    } {
        return {
            ...super.getProps(),
            type: 'final'
        }
    }

    override next() {
        return {}
    }
}