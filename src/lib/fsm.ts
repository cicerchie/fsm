interface FSMConfig {
  initial: string;
  on: any;
  states: any;
}

interface FSMParams {
  config: FSMConfig;
  context: any;
  receiveFn: (state: string, ctx: any) => void;
}

interface FSM {
  send: (event: string, data: any) => void;
}

export const newFSM = (params: FSMParams): FSM => {
  let currentState = params.config.initial;
  let ctx = params.context;
  let currentAbortController;

  function send(event, data) {
    const stateInfo = params.config.states[currentState];

    let next = (stateInfo.on || {})[event];
    if (!next) {
      // No transition for this event in the current state. Check the global handlers.
      next = params.config.on[event];
    }

    if (!next) {
      // No global handler for this event, and no handler in the current state, so ignore it.
      return;
    }

    runTransition(stateInfo, next, { event, data });
  }

  function runTransition(stateInfo, transition, eventData) {
    const targetState = transition.target;

    if (targetState) {
      // We're transitioning to another state, so try to abort the action if it hasn't finished running yet.
      if (currentAbortController) currentAbortController.abort();

      // Run the exit action
      if (stateInfo.exit) {
        const newCtx = stateInfo.exit(ctx, eventData);
        if (newCtx) ctx = newCtx;
      }
    }

    // Run the transition's action, if it has one.
    if (transition.action) {
      const newCtx = transition.action(ctx, eventData);
      if (newCtx) ctx = newCtx;
    }

    if (!targetState) {
      // If the transition has no target, then it's just an action, so return.
      params.receiveFn(currentState, ctx);
      return;
    }

    // Update the state if the transition has a target
    currentState = targetState;

    // And then run the next state's entry action, if there is one.
    const nextStateInfo = params.config.states[currentState];
    if (nextStateInfo.entry) {
      const newCtx = nextStateInfo.entry(ctx, eventData);
      if (newCtx) ctx = newCtx;
    }

    // Run the asynchronous action if there is one.
    const asyncAction = nextStateInfo.invoke;
    if (asyncAction) {
      // Create a new abort controller and save it.
      const abort = (currentAbortController = new AbortController());
      asyncAction
        .src(ctx, eventData, abort)
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
            });
          }
        });
    }

    params.receiveFn(currentState, ctx);
  }

  return { send };
};
