export interface IPayload {
  type: string;
}

export interface IMutationPayload extends IPayload {
  payload: any;
}

export interface IDispatchOptions {
  root?: boolean;
}

export interface ICommitOptions {
  silent?: boolean;
  root?: boolean;
}

export interface IDispatch {
  (type: string, payload?: any, options?: IDispatchOptions): Promise<any>;
  <P extends IPayload>(payloadWithType: P, options?: IDispatchOptions): Promise<
    any
  >;
}

export interface ICommit {
  (type: string, payload?: any, options?: ICommitOptions): void;
  <P extends IPayload>(payloadWithType: P, options?: ICommitOptions): void;
}

export interface IActionContext<S, R> {
  dispatch: IDispatch;
  commit: ICommit;
  state: S;
  getters: any;
  rootState: R;
  rootGetters: any;
}

export type TaggedActionContext<S, R> = IActionContext<S, R> & {
  _id: string;
};

export interface IBareActionContext<S, R> {
  state: S;
  rootState: R;
}

export type ActionHandler<S, R, P, T> = (
  context: IBareActionContext<S, R>,
  payload: P,
) => Promise<T> | T;
