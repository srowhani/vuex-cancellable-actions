export class ActionError extends Error {
  get name() {
    return 'ActionError';
  }
}

export const createActionError = (uid: string) => {
  throw new ActionError(`Action cancelled: ${uid}`);
};
