import { createComponentInstance, setupComponent } from './component'
import { ShapeFlags } from '../shared/ShapeFlags'
import { Fragment, Text } from './vnode'

export function render(vnode, container) {
  // patch
  patch(vnode, container, null)
}

function patch(vnode, container, parentComponent) {
  // shapeFlags
  // vnode -> flag 
 
  const { type, shapeFlag } = vnode
  switch (type) {
    case Fragment:
      processFragment(vnode, container, parentComponent)
      break;
    case Text:
      processText(vnode, container)
      break
    default:
      // 处理组件 
      // 判断是不是element 类型
      // is element type 需要用element处理
      if(shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container, parentComponent)
      } else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container, parentComponent)
      }
  }
}

function processText(vnode, container) {
  const { children } = vnode
  const textNode = (vnode.el = document.createTextNode(children))
  container.append(textNode)
}

function processFragment(vnode, container, parentComponent) {
  // fragement 
  mountChildren(vnode, container, parentComponent)
}

function processElement(vnode, container, parentComponent) {
  mountElement(vnode, container, parentComponent)
}


function processComponent(vnode, container, parentComponent) {
  mountComponent(vnode, container, parentComponent)
}

function mountComponent(initinalVnode, container, parentComponent) {
  const instance = createComponentInstance(initinalVnode, parentComponent)

  setupComponent(instance)
  
  setupRenderEffect(instance, initinalVnode, container)
}

// 处理element
function mountElement(vnode, container, parentComponent) {
  // tag
  const el = (vnode.el = document.createElement(vnode.type) )

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

    const isOn = (key:string) => /^on[A-Z]/.test(key)
    if(isOn(key)){
      const event = key.slice(2).toLowerCase()
      el.addEventListener(event, val)
    } else {
      el.setAttribute(key, val)
    }
  }

  // append
  container.append(el)
  
}

function mountChildren(vnode, container, parentComponent) {
  vnode.children.forEach(element => {
    patch(element, container, parentComponent)
  });
}

function setupRenderEffect(instance, initinalVnode, container) {

  // render 需要访问this
  const { proxy } = instance

  const subTree = instance.render.call(proxy)
  // vnode -> patch
  // vnode -> element -> mountElement
  patch(subTree, container, instance)

  // 这个时候所有的subTree都已经实例l好饿

  initinalVnode.el = subTree.el
}