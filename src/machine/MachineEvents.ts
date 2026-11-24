export enum MachineEvents {
    continue = 'continue',
    loop = 'loop',
    end = 'end',
    /** From any state: something the game cannot recover from. Goes to `failure`. */
    fail = 'fail'
}
