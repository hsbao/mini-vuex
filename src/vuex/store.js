import applyMixin from './mixin'
import { forEach } from './utils'

let Vue

class Store {
  constructor(options) {
    const state = options.state

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
