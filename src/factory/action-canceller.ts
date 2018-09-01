export function createActionCanceller() {
  const _cancelledActions = new Set<string>();
  return {
    cancel(_id: string) {
      _cancelledActions.add(_id);
    },
    isCancelled(_id: string): boolean {
      return _cancelledActions.has(_id);
    },
    clean(_id: string): boolean {
      return _cancelledActions.delete(_id);
    },
  };
}
