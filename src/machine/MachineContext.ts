/** Data that flows through the machine states, every state writes its part of it with `onSuccess`. */
export class MachineContext {
    error: Error | undefined
}
