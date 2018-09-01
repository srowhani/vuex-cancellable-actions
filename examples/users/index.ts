import Vue from 'vue';
import Vuex from 'vuex';

import { makeCancellable, takeLatest } from '../../dist'
import HomePage from './homepage';

Vue.use(Vuex);
type User = { _id: number };
type UserState = {
  users: User[]
}

const vuexStore = new Vuex.Store<UserState>({
  state: {
    users: [],
  },
  mutations: {
    addUser (state, newUser: { _id: number }) {
      state.users.push(newUser)
    }
  },
  actions: makeCancellable({
    addUser: takeLatest(async ({ state, commit, dispatch }) => {
      await dispatch('waitFirst'); // if not done waiting user won't get commited
      commit('addUser', { _id: state.users.length });
    }),
    waitFirst() {
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