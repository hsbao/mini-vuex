import applyMixin from './mixin'
import { forEach } from './utils'

let Vue

class Store {
  constructor(options) {
    const state = options.state || {}
    const mutations = options.mutations || []

    // vuex中的getter其实就是计算属性
    this.getters = {}
    const computed = {}
    /**
     * getters: {
     *   getAge(state) {
     *     return state.age
     *   }
     * }
     */
    forEach(options.getters, (getFn, key) => {
      // key   getAge
      // getFn 就是定义的函数
      // 把getters中的每一项绑定到vue的计算属性上，如果值没更新，则不会重新计算
      computed[key] = () => {
        return getFn.call(this, this.state)
      }
      Object.defineProperty(this.getters, key, {
        get: () => {
          return this._vm[key] // 因为上面已经绑定到计算属性上，可通过vue的实例拿到计算属性
        }
      })
    })

    // vuex的响应式原理，就是使用了vue的实例。数据发生变化，更新视图
    this._vm = new Vue({
      data() {
        return {
          $$state: state // 在vue中，如果定义的属性是以$开头，那么这个属性就不会代理到实例上
        }
      },
      computed
    })

    /**
     * mutations和actions，是基于发布订阅模式
     * 先将用户定义的mutions和actions保存起来
     * 调用commit的时候，就找到订阅的mutations中的方法
     * 调用dispatch的时候，就找到订阅的actions中的方法
     */
    this._mutations = {}
    forEach(mutations, (fn, type) => {
      this._mutations[type] = (payload) => fn.call(this, this.state, payload)
    })

    this._actions = {}
    forEach(options.actions, (fn, type) => {
      this._actions[type] = (payload) => fn.call(this, this, payload)
    })
  }
  // this.$store.commit('changeName', 'name')
  commit = (type, payload) => {
    this._mutations[type](payload)
  }
  // this.$store.dispatch('changeName', 'name')
  dispatch = (type, payload) => {
    this._actions[type](payload)
  }

  get state() {
    return this._vm._data.$$state
  }
}

const install = (_Vue) => {
  Vue = _Vue
  // 使用mixin
  applyMixin(Vue)
}

export { Store, install }
