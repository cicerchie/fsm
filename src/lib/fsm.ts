import { isString } from "./_utils";

interface FSMOnHandlerValue {
  target: string;
  action?: (ctx: any, event: any) => FSMContext | void;
  cond?: (ctx: any, event: any) => boolean;
}

type FSMOnHandler = FSMOnHandlerValue | string | null;

interface FSMMachineState {
  entry?: (ctx: any, event?: any) => FSMContext | void;
  exit?: (ctx: any, event: any) => FSMContext | void;
  invoke?: {
    src: (ctx: any, event: any, abortCtrl: AbortController) => Promise<any>;
    onDone: FSMOnHandlerValue;
    onError: FSMOnHandlerValue;
  };
  on?: { [key: string]: FSMOnHandler };
}

export interface FSMMachineConfig {
  initial: string;
  on?: { [key: string]: FSMOnHandler };
  states: { [key: string]: FSMMachineState };
}

interface FSMContext {
  [key: string]: any;
}

interface FSMParams {
  config: FSMMachineConfig;
  context: FSMContext;
  receiveFn: (state: string, ctx: any) => void;
}

interface FSM {
  send: (event: string, data: any) => void;
}

export const newFSM = (params: FSMParams): FSM => {
  let currentState = params.config.initial;
  let currentCtx = params.context;
  let currentAbortController;

  if (params.config.states[currentState].entry) {
    const newCtx = params.config.states[currentState].entry(currentCtx);
    if (newCtx) currentCtx = newCtx;
  }

  function send(event: string, data: any) {
    const stateInfo = params.config.states[currentState];

    let next = (stateInfo.on || {})[event];
    if (!next) {
      // No transition for this event in the current state. Check the global handlers.
      next = (params.config.on || {})[event];
    }

    if (!next) {
      // No global handler for this event, and no handler in the current state, so ignore it.
      return;
    }

    if (!isString(next) && !next.cond?.(currentCtx, { event, data })) {
      // The condition is false, I cannot proceed.
      return;
    }

    runTransition(stateInfo, next, { event, data });
  }

  function runTransition(
    stateInfo: FSMMachineState,
    transition: FSMOnHandler,
    eventData: any
  ) {
    const targetState = isString(transition) ? transition : transition.target;

    if (targetState) {
      // We're transitioning to another state, so try to abort the action if it hasn't finished running yet.
      if (currentAbortController) currentAbortController.abort();

      // Run the exit action
      if (stateInfo.exit) {
        const newCtx = stateInfo.exit(currentCtx, eventData);
        if (newCtx) currentCtx = newCtx;
      }
    }

    // Run the transition's action, if it has one.
    if (!isString(transition) && transition.action) {
      const newCtx = transition.action(currentCtx, eventData);
      if (newCtx) currentCtx = newCtx;
    }

    if (!targetState) {
      // If the transition has no target, then it's just an action, so return.
      params.receiveFn(currentState, currentCtx);
      return;
    }

    // Update the state if the transition has a target
    currentState = targetState;

    // And then run the next state's entry action, if there is one.
    const nextStateInfo = params.config.states[currentState];
    if (nextStateInfo.entry) {
      const newCtx = nextStateInfo.entry(currentCtx, eventData);
      if (newCtx) currentCtx = newCtx;
    }

    // Run the asynchronous action if there is one.
    const asyncAction = nextStateInfo.invoke;
    if (asyncAction) {
      // Create a new abort controller and save it.
      const abort = (currentAbortController = new AbortController());
      asyncAction
        .src(currentCtx, eventData, abort)
        .then((result) => {
          // If the request aborted, ignore it. This means that another event came in and we've already transitioned elsewhere.
          if (abort.signal.aborted) {
            return;
          }

          // Run the success transition
          if (asyncAction.onDone) {
            runTransition(nextStateInfo, asyncAction.onDone, {
              event: "invoke.onDone",
              data: result,
              invokeEvent: eventData,
            });
          }
        })
        .catch((reason) => {
          if (abort.signal.aborted) {
            return;
          }

          // Run the failure transition
          if (asyncAction.onError) {
            runTransition(nextStateInfo, asyncAction.onError, {
              event: "invoke.onError",
              data: reason,
              invokeEvent: eventData,
            });
          }
        });
    }

    params.receiveFn(currentState, currentCtx);
  }

  return { send };
};
