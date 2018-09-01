import { ActionContext } from 'vuex';

export type TaggedActionContext<S, R> = ActionContext<S, R> & {
  _id: string;
};
