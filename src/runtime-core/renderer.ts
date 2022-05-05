import { createComponentInstance, setupComponent } from './component'
import { isObject } from '../shared/index'
export function render(vnode, container) {
  // patch
  patch(vnode, container)
}


function patch(vnode, container) {
  // 处理组件 
  // 判断是不是element 类型
  // is element type 需要用element处理
  if(typeof vnode.type === 'string') {
    processElement(vnode, container)
  } else if(isObject(vnode.type)) {
    processComponent(vnode, container)
  }
}

function processElement(vnode, container) {
  mountElement(vnode, container)
}


function processComponent(vnode, container) {
  mountComponent(vnode, container)
}

function mountComponent(initinalVnode, container) {
  const instance = createComponentInstance(initinalVnode)

  setupComponent(instance)
  
  setupRenderEffect(instance, initinalVnode, container)
}

// 处理element
function mountElement(vnode, container) {
  // tag
  const el = (vnode.el = document.createElement(vnode.type) )

  const { children, props } = vnode

  // child
  if(typeof children === 'string') {
    el.textContent = children
  } else {
    mountChildren(vnode, el)
  }
  
  // props
  for(const key in props) {
    const val = props[key]
    el.setAttribute(key, val)
  }

  // append
  container.append(el)
  
}

function mountChildren(vnode, container) {
  vnode.children.forEach(element => {
    patch(element, container)
  });
}

function setupRenderEffect(instance, initinalVnode, container) {

  // render 需要访问this
  const { proxy } = instance

  const subTree = instance.render.call(proxy)
  // vnode -> patch
  // vnode -> element -> mountElement
  patch(subTree, container)

  // 这个时候所有的subTree都已经实例l好饿

  initinalVnode.el = subTree.el
}