import { forEach } from '../utils'

export default class Module {
  constructor(rootModule) {
    this._rawModule = rootModule
    this._children = {}
    this.state = rootModule.state
  }

  // 根据模块名称找到对应的子模块
  getChild(moduleName) {
    return this._children[moduleName]
  }

  // 给对应的模块增加子模块
  addChild(moduleName, module) {
    this._children[moduleName] = module
  }

  forEachMutations(callback) {
    if (this._rawModule.mutations) {
      forEach(this._rawModule.mutations, callback)
    }
  }

  forEachActions(callback) {
    if (this._rawModule.actions) {
      forEach(this._rawModule.actions, callback)
    }
  }

  forEachGetter(callback) {
    if (this._rawModule.getters) {
      forEach(this._rawModule.getters, callback)
    }
  }

  forEachChild(callback) {
    forEach(this._children, callback)
  }
}
