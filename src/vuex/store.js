import applyMixin from './mixin'
import { forEach } from './utils'
import ModuleCollection from './module/module-collection'

let Vue

// 根据path，从store里取到最新的state
function getState(store, path) {
  return path.reduce((newState, current) => {
    return newState[current]
  }, store.state)
}

/**
 * 将模块上的属性，定义到store上
 * @param {*} store 当前vuex的实例
 * @param {*} rootState 跟模块的state，也就是第一层的state
 * @param {*} path 表示当前模块层级 [] [a] [a, c]
 * @param {*} module 当前模块：state, getters, actions, mutations
 */
function installModule(store, rootState, path, module) {
  // 注册mutation，action事件时，需要注册到对应的命名空间中，path就是所有的路径
  let namespace = store._modules.getNamespace(path)
  // console.log('namespace---', namespace)
  // 如果是子模块，需要将子模块的状态定义到根模块上
  if (path.length > 0) {
    let parent = path.slice(0, -1).reduce((memo, current) => {
      return memo[current] // 遍历path，从根模块开始，找到当前模块的父模块
    }, rootState)
    store._waitCommitting(() => {
      Vue.set(parent, path[path.length - 1], module.state)
    })
  }

  module.forEachMutations((mutation, type) => {
    const fullType = namespace + type
    store._mutations[fullType] = store._mutations[fullType] || []
    // 多层级modules可能有多个，所以放到数组里
    store._mutations[fullType].push((payload) => {
      //
      store._waitCommitting(() => {
        mutation.call(store, getState(store, path), payload)
      })

      // 修改数据的时候，调用subscribe订阅的事件
      store._subscribes.forEach((sub) => {
        sub(
          {
            mutation,
            type
          },
          store.state
        )
      })
    })
  })
  module.forEachActions((action, type) => {
    const fullType = namespace + type
    store._actions[fullType] = store._actions[fullType] || []
    store._actions[fullType].push((payload) => {
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

  const oldVM = store._vm

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

  // 如果是严格模式，深度监听state是变化，里面的属性一发生变化，同步触发回调
  if (store.strict) {
    store._vm.$watch(
      () => store._vm._data.$$state,
      () => {
        console.assert(store._committing, '不能绕过mutations更改state')
      },
      {
        deep: true,
        sync: true
      }
    )
  }

  if (oldVM) {
    Vue.nextTick(() => {
      oldVM.$destroy()
    })
  }
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
    this._subscribes = []
    this.strict = options.strict // 严格模式，true为严格模式
    this.plugins = options.plugins || [] // 插件

    // 同步的watc
    this._committing = false

    installModule(this, state, [], this._modules.root)
    console.log(state)

    // 3. 将处理好的state放到vue的实例中
    resetStoreVm(this, state)

    // 插件：每个插件都是一个函数，接收当前store，并执行
    this.plugins.forEach((plugin) => plugin(this))
  }
  _waitCommitting(fn) {
    let committing = this._committing
    this._committing = true
    fn()
    this._committing = committing
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

  // 手动注册新的模块
  registerModule(path, rawModule) {
    if (typeof path === 'string') {
      path = [path]
    }
    // 1. 调用注册模块的方法
    this._modules.register(path, rawModule)

    // 2. 安装模块
    installModule(this, this.state, path, rawModule.rawModule)

    // 更新所有状态
    resetStoreVm(this, this.state)
    console.log(this.state)
  }

  // 替换最新state
  replaceState(newState) {
    this._waitCommitting(() => {
      this._vm._data.$$state = newState
    })
  }

  subscribe(fn) {
    this._subscribes.push(fn)
  }
}

const install = (_Vue) => {
  Vue = _Vue
  // 使用mixin
  applyMixin(Vue)
}

export { Store, install }
