export enum MachineStates {
    idle = 'idle',
    init = 'init',
    ready = 'ready',
    starting = 'starting',
    resolving = 'resolving',
    presenting = 'presenting',
    complete = 'complete', // we decide if to loop, end, or give these options to the player in awaitingDecision
    awaitingDecision = 'awaitingDecision', // player decide to loop or end
    completed = 'completed',
    failure = 'failure',
}
