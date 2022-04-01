import Vue from 'vue'
import Vuex from '../vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    name: 'abao'
  },
  actions: {
    changeName({ commit }, payload) {
      commit('changeName', payload)
    }
  },
  mutations: {
    changeName(state, payload) {
      state.name = payload
    }
  }
})

export default store
