const applyMixin = (Vue) => {
  Vue.mixin({
    beforeCreate() {
      const options = this.$options
      // 跟组件上才有store，然后把store挂载到$store上
      if (options.store) {
        this.$store = options.store
      } else if (options.parent && options.parent.$store) {
        // 这样会给每个组件实例都加上$store，实现全局组件通信
        this.$store = options.parent.$store
      }
    }
  })
}

export default applyMixin
