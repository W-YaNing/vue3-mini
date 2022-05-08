import { createComponentInstance, setupComponent } from './component'
import { ShapeFlags } from '../shared/ShapeFlags'
import { Fragment, Text } from './vnode'
import { createAppAPI } from './createApp'
import { effect } from '../reactivity/effect'
import { EMPTY_OBJ } from '../shared/index'

export function createRenderer(options) {
  const { 
    createElement: hostCreateElement, 
    patchProp: hostPatchProp, 
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText
  } = options

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
    mountChildren(n2.children, container, parentComponent)
  }

  function processElement(n1, n2, container, parentComponent) {
    if(!n1) {
      mountElement(n2, container, parentComponent)
    } else {
      patchElement(n1, n2, container, parentComponent)
    }
  }

  function patchElement(n1, n2, container, parentComponent) {
    // 处理更新逻辑
    const oldProps = n1.props || EMPTY_OBJ
    const newProps = n2.props || EMPTY_OBJ

    const el = (n2.el = n1.el)
    
    patchChildren(n1, n2, el, parentComponent)
    patchProps(el, oldProps, newProps)
  }

  function patchChildren(n1, n2, container, parentComponent) {
    const c1 = n1.children
    const prevShapeFlage = n1.shapeFlag
    const { shapeFlag } = n2

    const c2 = n2.children
    
    if(shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if(prevShapeFlage & ShapeFlags.ARRAY_CHILDREN) {
        // 新节点的children是 text节点 老节点的children 是 array节点
        // 清空老的
        unmountChildren(n1.children)
      }
      if(c1 !== c2) {
        // 设置text
        hostSetElementText(container, c2)
      }
    } else {
      // 新的是数组 判断之前的
      if(prevShapeFlage & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, '')
        mountChildren(c2, container, parentComponent)
      }
    }
  }

  function unmountChildren(children) {
    for(let i = 0; i < children.length; i++) {
      const el = children[i].el
      hostRemove(el)
    }
  }

  function patchProps(el, oldProps, newProps) {
    if(oldProps !== newProps) {
      for(const key in newProps) {
        const prevProp = oldProps[key]
        const nextProp = newProps[key]
        if(prevProp !== nextProp) {
          hostPatchProp(el, key, prevProp, nextProp)
        }
      }
      
      if(oldProps !== EMPTY_OBJ) {
        for(const key in oldProps) {
          if(!(key in newProps)) {
            hostPatchProp(el, key, oldProps[key], null)
          }
        }
      }
    }
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
      mountChildren(vnode.children, el, parentComponent)
    }
    
    // props
    for(const key in props) {
      const val = props[key]
      hostPatchProp(el, key, null, val)
    }

    // append
    // container.append(el)
    hostInsert(el, container)
  }

  function mountChildren(children, container, parentComponent) {
    children.forEach(element => {
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