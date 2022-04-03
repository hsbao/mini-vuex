import Vue from 'vue'
import Vuex from '../vuex'

Vue.use(Vuex)

let store = new Vuex.Store({
  namespace: true,
  state: {
    name: 'abao',
    age: 27
  },
  getters: {
    getAge(state) {
      return state.age
    }
  },
  actions: {
    changeName({ commit }, payload) {
      console.log(commit)
      commit('changeName', payload)
    }
  },
  mutations: {
    changeName(state, payload) {
      state.name = payload
    }
  },
  modules: {
    a: {
      state: { name: 'a' },
      modules: {
        c: {
          namespace: true,
          state: { name: 'c' }
        }
      }
    },
    b: {
      namespace: true,
      state: { name: 'b' }
    }
  }
})

store.registerModule(['e'], {
  state: {
    name: 'eeeeee'
  }
})

export default store
