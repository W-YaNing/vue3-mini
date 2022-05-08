import { createComponentInstance, setupComponent } from './component'
import { ShapeFlags } from '../shared/ShapeFlags'
import { Fragment, Text } from './vnode'
import { createAppAPI } from './createApp'
import { effect } from '../reactivity/effect'

export function createRenderer(options) {
  const { createElement: hostCreateElement, patchProp: hostPatch, insert: hostInsert } = options

  function render(vnode, container) {
    // patch
    patch(null, vnode, container, null)
  }

  // n1 老节点 n2 新节点
  function patch(n1, n2, container, parentComponent) {
    // shapeFlags
    // vnode -> flag 
  
    const { type, shapeFlag } = n2
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent)
        break;
      case Text:
        processText(n1, n2, container)
        break
      default:
        // 处理组件 
        // 判断是不是element 类型
        // is element type 需要用element处理
        if(shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent)
        } else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent)
        }
    }
  }

  function processText(n1, n2, container) {
    const { children } = n2
    const textNode = (n2.el = document.createTextNode(children))
    container.append(textNode)
  }

  function processFragment(n1, n2, container, parentComponent) {
    // fragement 
    mountChildren(n2, container, parentComponent)
  }

  function processElement(n1, n2, container, parentComponent) {
    if(!n1) {
      mountElement(n2, container, parentComponent)
    } else {
      patchElement(n1, n2, container)
    }
  }

  function patchElement(n1, n2, container) {
    console.log(n1)
    console.log(n2)

    // 处理更新逻辑
  }

  function processComponent(n1, n2, container, parentComponent) {
    mountComponent(n2, container, parentComponent)
  }

  function mountComponent(initinalVnode, container, parentComponent) {
    const instance = createComponentInstance(initinalVnode, parentComponent)

    setupComponent(instance)
    
    setupRenderEffect(instance, initinalVnode, container)
  }

  // 处理element
  function mountElement(vnode, container, parentComponent) {
    // tag
    // const el = (vnode.el = document.createElement(vnode.type) )
    const el = (vnode.el = hostCreateElement(vnode.type) )

    const { children, props, shapeFlag } = vnode
    // child
    if(shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children
    } else if(shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode, el, parentComponent)
    }
    
    // props
    for(const key in props) {
      const val = props[key]
      hostPatch(el, key, val)
    }

    // append
    // container.append(el)
    hostInsert(el, container)
  }

  function mountChildren(vnode, container, parentComponent) {
    vnode.children.forEach(element => {
      patch(null, element, container, parentComponent)
    });
  }

  function setupRenderEffect(instance, initinalVnode, container) {
    effect(() => {
      if(!instance.isMounted) {
        // render 需要访问this
        const { proxy } = instance

        const subTree = (instance.subTree  = instance.render.call(proxy))
        // vnode -> patch
        // vnode -> element -> mountElement
        patch(null, subTree, container, instance)

        // 这个时候所有的subTree都已经实例l好饿

        initinalVnode.el = subTree.el

        instance.isMounted = true
      } else {
        
        // render 需要访问this
        const { proxy } = instance

        const subTree = instance.render.call(proxy)
        const prevSubTree = instance.subTree

        instance.subTree = subTree

        patch(prevSubTree, subTree, container, instance)

      }
    })
  } 

  return {
    createApp: createAppAPI(render)
  }
}