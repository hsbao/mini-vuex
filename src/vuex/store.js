import applyMixin from './mixin'

let Vue

class Store {
  constructor(options) {
    const state = options.state

    // vuex的响应式原理，就是使用了vue的实例。数据发生变化，更新视图
    this._vm = new Vue({
      data() {
        return {
          $$state: state // 在vue中，如果定义的属性是以$开头，那么这个属性就不会代理到实例上
        }
      }
    })

    console.log(this._vm)
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
