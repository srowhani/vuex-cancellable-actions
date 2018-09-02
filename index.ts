import Vue from 'vue';
import Vuex, { ActionContext } from 'vuex';

import { makeCancellable, takeLatest } from '../../dist'
import HomePage from './homepage';

Vue.use(Vuex);
type Task = {
  cancelled: boolean,
  finished: boolean
};
type TaskState = {
  tasks: Task[]
}

const vuexStore = new Vuex.Store<TaskState>({
  state: {
    tasks: [],
  },
  mutations: {
    addTask (state: TaskState) {
      const task = state.tasks[state.tasks.length - 1];
      if (task && task.finished) {
        state.tasks = [];
      }

      state.tasks.push({
        cancelled: false,
        finished: false
      });

      return state.tasks.length;
    },
    cancelLatestTask (state: TaskState) {
      const task = state.tasks[state.tasks.length - 1];
      if (!task.finished) {
        task.cancelled = true;
      }
    },
    finishLatestTask (state: TaskState) {
      state.tasks[state.tasks.length - 1].finished = true;
    },
  },
  actions: makeCancellable({
    addTask: takeLatest(async ({ state, commit, dispatch }: ActionContext<TaskState, void>) => {
      if (state.tasks.length > 0) {
        commit('cancelLatestTask');
      }
      commit('addTask');

      await dispatch('delay'); // if not done waiting user won't get commited
      commit('finishLatestTask');
    }),
    delay() {
      return new Promise(resolve => setTimeout(resolve, 1000));
    }
  })
})

new Vue({
  el: '#app',
  components: {
    'home-page': HomePage
  },
  template: `
    <home-page></home-page>
  `,
  store: vuexStore,
})