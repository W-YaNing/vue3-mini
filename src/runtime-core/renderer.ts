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
    patch(null, vnode, container, null, null)
  }

  // n1 老节点 n2 新节点
  function patch(n1, n2, container, parentComponent, anchor) {
    // shapeFlags
    // vnode -> flag 
  
    const { type, shapeFlag } = n2
    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentComponent, anchor)
        break;
      case Text:
        processText(n1, n2, container)
        break
      default:
        // 处理组件 
        // 判断是不是element 类型
        // is element type 需要用element处理
        if(shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentComponent, anchor)
        } else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentComponent, anchor)
        }
    }
  }

  function processText(n1, n2, container) {
    const { children } = n2
    const textNode = (n2.el = document.createTextNode(children))
    container.append(textNode)
  }

  function processFragment(n1, n2, container, parentComponent, anchor) {
    // fragement 
    mountChildren(n2.children, container, parentComponent, anchor)
  }

  function processElement(n1, n2, container, parentComponent, anchor) {
    if(!n1) {
      mountElement(n2, container, parentComponent, anchor)
    } else {
      patchElement(n1, n2, container, parentComponent, anchor)
    }
  }

  function patchElement(n1, n2, container, parentComponent, anchor) {
    // 处理更新逻辑
    const oldProps = n1.props || EMPTY_OBJ
    const newProps = n2.props || EMPTY_OBJ

    const el = (n2.el = n1.el)
    
    patchChildren(n1, n2, el, parentComponent, anchor)
    patchProps(el, oldProps, newProps)
  }

  function patchChildren(n1, n2, container, parentComponent, anchor) {
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
        mountChildren(c2, container, parentComponent, anchor)
      } else {
        // array to array
        patchKeyedChildren(c1, c2, container, parentComponent, anchor)
      }
    }
  }

  function patchKeyedChildren(c1, c2, container, parentComponent, parentAnchor) {

    // c1为旧节点的children
    // c2为新节点的children
    const l2 = c2.length 

    let i = 0;
    let e1 = c1.length - 1
    let e2 = l2 - 1
    
    // 左侧对比 相同type以及相同key 进行patch
    while(i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]
      
      if(isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        break;
      }
      i++
    }

    // 右侧对比
    while(i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = c2[e2]

      if(isSomeVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor)
      } else {
        break;
      }
      e1--
      e2--
    }
    
    if(i > e1) {
      // 新的比老的多 进行创建 
      if(i<= e2) {
        const nextPos = e2 + 1
        const anchor = nextPos < l2 ? c2[nextPos].el : null
        while(i <= e2) {
          patch(null, c2[i], container, parentComponent, anchor)
          i++
        }
      }
    } else if(i > e2) {
      // 老的比新的多 进行删除
      while(i <= e1) {
        hostRemove(c1[i].el)
        i++
      } 
    } else {
      // 乱序的情况
    }
  }

  function isSomeVNodeType(n1, n2) {
    // type
    // key
    return n1.type === n2.type && n1.key === n2.key
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

  function processComponent(n1, n2, container, parentComponent, anchor) {
    mountComponent(n2, container, parentComponent, anchor)
  }

  function mountComponent(initinalVnode, container, parentComponent, anchor) {
    const instance = createComponentInstance(initinalVnode, parentComponent)

    setupComponent(instance)
    
    setupRenderEffect(instance, initinalVnode, container, anchor)
  }

  // 处理element
  function mountElement(vnode, container, parentComponent, anchor) {
    // tag
    // const el = (vnode.el = document.createElement(vnode.type) )
    const el = (vnode.el = hostCreateElement(vnode.type) )

    const { children, props, shapeFlag } = vnode
    // child
    if(shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      el.textContent = children
    } else if(shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode.children, el, parentComponent, anchor)
    }
    
    // props
    for(const key in props) {
      const val = props[key]
      hostPatchProp(el, key, null, val)
    }

    // append
    // container.append(el)
    hostInsert(el, container, anchor)
  }

  function mountChildren(children, container, parentComponent, anchor) {
    children.forEach(element => {
      patch(null, element, container, parentComponent, anchor)
    });
  }

  function setupRenderEffect(instance, initinalVnode, container, anchor) {
    effect(() => {
      if(!instance.isMounted) {
        // render 需要访问this
        const { proxy } = instance

        const subTree = (instance.subTree  = instance.render.call(proxy))
        // vnode -> patch
        // vnode -> element -> mountElement
        patch(null, subTree, container, instance, anchor)

        // 这个时候所有的subTree都已经实例l好饿

        initinalVnode.el = subTree.el

        instance.isMounted = true
      } else {
        
        // render 需要访问this
        const { proxy } = instance

        const subTree = instance.render.call(proxy)
        const prevSubTree = instance.subTree

        instance.subTree = subTree

        patch(prevSubTree, subTree, container, instance, anchor)

      }
    })
  } 

  return {
    createApp: createAppAPI(render)
  }
}