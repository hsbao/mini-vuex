import { forEach } from '../utils'
import Module from './module'

export default class ModuleCollection {
  constructor(options) {
    this.root = {}
    // 1. 递归注册模块
    this.register([], options)
  }

  // 获取命名空间
  getNamespace(path) {
    let root = this.root
    return path.reduce((namespace, key) => {
      root = root.getChild(key)
      let n = root.namespace ? `${key}/` : ''
      return namespace + n
    }, '')
  }

  register(path, rootModule) {
    let newModule = new Module(rootModule)
    rootModule.rawModule = newModule // 这里是为了给registerModule手动注册模块的时候使用的
    // 第一次注册表示最外层的根模块
    if (path.length === 0) {
      this.root = newModule
    } else {
      // 递归注册子模块时
      // 第二次注册时， path = ['a']，通过path[path.length - 1]，取到当前需要注册的模块
      // this.root._children[path[path.length - 1]] = newModule  这种只能实现两层模块
      let parent = path.slice(0, -1).reduce((memo, current) => {
        return memo.getChild(current) // 遍历path，从根模块开始，找到当前模块的父模块
      }, this.root)
      console.log(parent)
      parent.addChild([path[path.length - 1]], newModule)
    }

    // 如果有定义modules，说明有子模块，然后递归进行注册模块
    /**
     * store = {
     *    state: {},
     *    actions: {},
     *    ...
     *    modules: {
     *        a: { state: {} },
     *        b: { state: {} },
     *    }
     * }
     */
    if (rootModule.modules) {
      forEach(rootModule.modules, (module, moduleName) => {
        // this.register([...path, 'a'], { state: {} })
        this.register([...path, moduleName], module)
      })
    }
  }
}

/* 把用户传进来的数据格式化成一个树形结构 */

/**
 * this.root = {
 *     _raw: xxx,
 *     state: xxx.state,
 *     ...
 *     _children: {
 *         a: {
 *            _raw: xxx,
 *            _children: {...}
 *         },
 *         b: {
 *            _raw: xxx,
 *            _children: {...}
 *         },
 *     }
 * }
 */
