
import { render } from './renderer'

export function createApp(rootComponent) {
  return {
    mount(rootContainer) {
      // 先vnode
      // 所有的逻辑操作都会给予vnode做处理
      const vnode = createVNode(rootComponent)

      render(vnode, rootContainer)
    }
  }
}

