import Vue from 'vue'
import Vuex from '../vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
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
    subModule: {
      state: {},
      getters: {},
      actions: {},
      mutations: {}
    }
  }
})

export default store
