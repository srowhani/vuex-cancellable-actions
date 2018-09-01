import { ActionError } from '@src/factory';
import { TaggedActionContext } from '@src/types';
import Vuex from 'vuex'
import { cancelAction, makeCancellable, takeLatest } from '../src'

function delay (ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const calls: string[] = [];
const commits: [string, {[k: string]: any}][] = [];

function testWrapper<LocalState, BaseState>(fn: (context: TaggedActionContext<LocalState, BaseState>, ...args: any[]) => void) {
  return function wrapper (context: TaggedActionContext<LocalState, BaseState>, ...args: any[]) {
    calls.push(context._id)
    return fn(context, ...args)
  }
}

function flushArray (a) {
  while (a.length) {
    a.pop()
  }
}

let storeData: any;

describe('API test', () => {
  beforeEach(() => {
    storeData = {
      state: {
        prop1: null,
        prop2: null,
      },
      mutations: {
        setProp1 (state, { prop1 }) {
          state.prop1 = prop1
          commits.push(['setProp1', { prop1 }])
        },
        setProp2 (state, { prop2 }) {
          state.prop2 = prop2
          commits.push(['setProp2', { prop2 }])
        },
      },
      actions: {
        action1: async ({ commit, dispatch }, { prop1, prop2 }) => {
          await delay(100)
          commit('setProp1', { prop1: prop1 + prop2 })
          dispatch('action2', { prop2 })
        },
        action2 ({ commit }, { prop2 }) {
          commit('setProp2', { prop2 })
        },
      },
    }
  })

  describe('cancellableActions', () => {
    it('makes an action cancellable by passing rootActionId in the payload', async () => {
      storeData.actions = makeCancellable<{}, {}, {}, void>({
        action1: testWrapper(storeData.actions.action1),
        action2: storeData.actions.action2,
      })
      const store = new Vuex.Store(storeData)
      const p1 = store.dispatch('action1', { prop1: 'hello', prop2: 'world' })
      expect(calls[0]).not.toBe(undefined)
      await p1
      expect(commits).toEqual(
        [['setProp1', {prop1: 'helloworld'}], ['setProp2', {prop2: 'world'}]]
      )

      flushArray(commits)
      const p2 = store.dispatch('action1', { prop1: 'hello', prop2: 'world' })
      expect(calls[1]).not.toBe(undefined)
      cancelAction(calls[1])
      try {
        await p2
      } catch (e) {
        expect(e).toBeInstanceOf(ActionError);
      }
      expect(commits[0]).toBe(undefined)
    })
  })

  describe('takeLatest', () => {
    it('only takes into account the last call to an action', async () => {
      storeData.actions = makeCancellable({
        action1: takeLatest(storeData.actions.action1),
        action2: storeData.actions.action2,
      })
      const store = new Vuex.Store(storeData)
      const p1 = store.dispatch('action1', { prop1: 'hello', prop2: 'world', timeout: 100 })
      await delay(10)
      const p2 = store.dispatch('action1', { prop1: 'goodbye', prop2: 'lennin', timeout: 10 })

      // p1 starts first but finishes last, it is cancelled by p2 and never commits
      await Promise.all([p1, p2])
      expect(commits).toEqual(
        [['setProp1', {prop1: 'goodbyelennin'}], ['setProp2', {prop2: 'lennin'}]]
      )
    })
  })
})