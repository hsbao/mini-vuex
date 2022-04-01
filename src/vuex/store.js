import applyMixin from './mixin'

let Vue

class Store {
  constructor(options) {
    console.log(options)
  }
}

const install = (_Vue) => {
  Vue = _Vue
  // 使用mixin
  applyMixin(Vue)
}

export { Store, install }
