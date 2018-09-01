import {
  ActionError,
  createActionCanceller,
  createActionError,
} from './factory';
import { ActionHandler, TaggedActionContext } from './types';
import { nextUid } from './utils';

const actionCanceller = createActionCanceller();

export function wrapAction<LocalState, BaseState, Payload, ReturnType>(
  baseAction: ActionHandler<LocalState, BaseState, Payload, ReturnType>,
): ActionHandler<LocalState, BaseState, Payload, ReturnType> {
  // actions defined in vuex store cannot have same name.
  return async (
    context: TaggedActionContext<LocalState, BaseState>,
    payload: Payload,
  ) => {
    const isRootAction = !context._id; // if _id has yet to be defined it implies that it's the root action
    context._id = context._id || nextUid();

    const { _id } = context;

    const commit = context.commit.bind(context);
    const dispatch = context.dispatch.bind(context);

    context.commit = function wrappedCommit(...commitArgs: any[]) {
      if (actionCanceller.isCancelled(_id)) {
        createActionError(_id);
      }
      return commit(...commitArgs);
    };

    context.dispatch = function wrappedDispatch(...dispatchArgs: any[]) {
      if (actionCanceller.isCancelled(_id)) {
        createActionError(_id);
      }
      return dispatch(...dispatchArgs);
    };

    const returnValue = await baseAction(context, payload);

    if (isRootAction) {
      actionCanceller.clean(context._id);
    }

    return returnValue;
  };
}

export function makeCancellable<
  LocalState,
  BaseState,
  Payload,
  ReturnType
>(actions: {
  [_dispatchKey: string]: ActionHandler<
    LocalState,
    BaseState,
    Payload,
    ReturnType
  >;
}) {
  Object.keys(actions).forEach(
    action => (actions[action] = wrapAction(actions[action])),
  );
  return actions;
}

export function takeLatest<LocalState, BaseState, Payload, ReturnType>(
  baseAction: ActionHandler<LocalState, BaseState, Payload, ReturnType>,
): ActionHandler<LocalState, BaseState, Payload, ReturnType> {
  const previousCalls: string[] = [];
  return async function takeLatestActionWrapper(
    context: TaggedActionContext<LocalState, BaseState>,
    payload: Payload,
  ) {
    while (previousCalls.length > 0) {
      actionCanceller.cancel(previousCalls.pop()!);
    }
    previousCalls.push(context._id);

    try {
      return await baseAction(context, payload);
    } catch (error) {
      // if an error that isn't of type action error is received, bubble
      if (!(error instanceof ActionError)) {
        throw error;
      }

      return {} as ReturnType; // return empty payload in the case that
    }
  };
}

export function cancelAction(_actionId: string) {
  actionCanceller.cancel(_actionId);
}
