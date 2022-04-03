import applyMixin from './mixin'
import { forEach } from './utils'
import ModuleCollection from './module/module-collection'

let Vue

/**
 * 将模块上的属性，定义到store上
 * @param {*} store 当前vuex的实例
 * @param {*} rootState 跟模块的state，也就是第一层的state
 * @param {*} path 表示当前模块层级 [] [a] [a, c]
 * @param {*} module 当前模块：state, getters, actions, mutations
 */
function installModule(store, rootState, path, module) {
  // 如果是子模块，需要将子模块的状态定义到根模块上
  if (path.length > 0) {
    let parent = path.slice(0, -1).reduce((memo, current) => {
      return memo[current] // 遍历path，从根模块开始，找到当前模块的父模块
    }, rootState)
    Vue.set(parent, path[path.length - 1], module.state)
  }

  module.forEachMutations((mutation, type) => {
    store._mutations[type] = store._mutations[type] || []
    // 多层级modules可能有多个，所以放到数组里
    store._mutations[type].push((payload) => {
      mutation.call(store, module.state, payload)
    })
  })
  module.forEachActions((action, type) => {
    store._actions[type] = store._actions[type] || []
    store._actions[type].push((payload) => {
      action.call(store, store, payload)
    })
  })
  module.forEachGetter((getter, key) => {
    // 如果getters里有重名的，会直接覆盖。子模块也是一样的
    // 所有模块的getters，都会定义到根模块上
    store._wrappedGetters[key] = function () {
      return getter(module.state)
    }
  })
  module.forEachChild((childModule, childModuleName) => {
    installModule(store, rootState, path.concat(childModuleName), childModule)
  })
}

function resetStoreVm(store, state) {
  const wrappedGetters = store._wrappedGetters
  let computed = {}
  store.getters = {}

  forEach(wrappedGetters, (fn, key) => {
    computed[key] = function () {
      return fn()
    }
    Object.defineProperty(store.getters, key, {
      get: () => store._vm[key] // 因为上面已经绑定到计算属性上，可通过vue的实例拿到计算属性
    })
  })

  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed
  })
}
class Store {
  constructor(options) {
    // const state = options.state || {}

    // vuex中的getter其实就是计算属性
    // this.getters = {}
    // const computed = {}
    /**
     * getters: {
     *   getAge(state) {
     *     return state.age
     *   }
     * }
     */
    // forEach(options.getters, (getFn, key) => {
    //   // key   getAge
    //   // getFn 就是定义的函数
    //   // 把getters中的每一项绑定到vue的计算属性上，如果值没更新，则不会重新计算
    //   computed[key] = () => {
    //     return getFn.call(this, this.state)
    //   }
    //   Object.defineProperty(this.getters, key, {
    //     get: () => {
    //       return this._vm[key] // 因为上面已经绑定到计算属性上，可通过vue的实例拿到计算属性
    //     }
    //   })
    // })

    // vuex的响应式原理，就是使用了vue的实例。数据发生变化，更新视图
    // this._vm = new Vue({
    //   data() {
    //     return {
    //       $$state: state // 在vue中，如果定义的属性是以$开头，那么这个属性就不会代理到实例上
    //     }
    //   },
    //   computed
    // })

    /**
     * mutations和actions，是基于发布订阅模式
     * 先将用户定义的mutions和actions保存起来
     * 调用commit的时候，就找到订阅的mutations中的方法
     * 调用dispatch的时候，就找到订阅的actions中的方法
     */
    // this._mutations = {}
    // forEach(options.mutations, (fn, type) => {
    //   this._mutations[type] = (payload) => fn.call(this, this.state, payload)
    // })

    // this._actions = {}
    // forEach(options.actions, (fn, type) => {
    //   this._actions[type] = (payload) => fn.call(this, this, payload)
    // })

    /*  上面只是实现简单的一层state，实际使用的时候，可以定义不同的module，每个module模块都有自己的state  */

    // 1. 格式化用户传进来的参数
    this._modules = new ModuleCollection(options)

    // 2. 格式完参数后，将模块上的属性，定义到store上
    let state = this._modules.root.state
    this._mutations = {}
    this._actions = {}
    this._wrappedGetters = {}
    installModule(this, state, [], this._modules.root)
    console.log(state)

    // 3. 将处理好的state放到vue的实例中
    resetStoreVm(this, state)
  }
  // this.$store.commit('changeName', 'name')
  commit = (type, payload) => {
    this._mutations[type].forEach((fn) => fn(payload))
  }
  // this.$store.dispatch('changeName', 'name')
  dispatch = (type, payload) => {
    this._actions[type].forEach((fn) => fn(payload))
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
