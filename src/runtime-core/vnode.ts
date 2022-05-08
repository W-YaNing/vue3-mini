import { ShapeFlags } from '../shared/ShapeFlags'

export const Fragment = Symbol('Fragment')
export const Text = Symbol('Text')

export function createVNode(type, props?, children?) {
  const vnode = {
    type,
    props,
    key: props && props.key,
    children,
    shapeFlag: getShapeFlag(type),
    el: null
  }
  if(typeof children === 'string' || typeof children === 'number' ) {
    vnode.shapeFlag |=  ShapeFlags.TEXT_CHILDREN
  } else if(Array.isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
  }

  // 判断slot 
  if(vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    if(typeof children === 'object') {
      vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN
    }
  }


  return vnode
}

export function createTextVNode(text: string) {
  return createVNode(Text, {}, text)
}

function getShapeFlag(type) {
  return typeof type === 'string' ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT
}

