import Vue from 'vue'
import Vuex from '../vuex'

Vue.use(Vuex)

/**
 * 持久化插件
 * 1. vuex插件是一个函数，接收store实例
 * 2. store上有subscribe，只要数据一变，就会触发
 * @param {*} store
 */
function persists(store) {
  let local = localStorage.getItem('VUEX:STATE')
  if (local) {
    store.replaceState(JSON.parse(local))
  }
  store.subscribe((mutation, state) => {
    console.log(mutation, state)
    localStorage.setItem('VUEX:STATE', JSON.stringify(state))
  })
}

let store = new Vuex.Store({
  namespace: true,
  plugins: [persists],
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
