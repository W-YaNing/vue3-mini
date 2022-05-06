import { isObject } from '../shared/index'
import { mutableHanders, readonlyHandlers, shoallowReadonlyHandlers } from './baseHanlers'

export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly"
}


export function reactive (raw) {
  return createActiveObject(raw, mutableHanders)
}

export function readonly (raw) {
  return createActiveObject(raw, readonlyHandlers)
}

export function shoallowReadonly(raw) {
  return createActiveObject(raw, shoallowReadonlyHandlers)
}

export function isReactive(raw) {
  return !!raw[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(raw) {
  return !!raw[ReactiveFlags.IS_READONLY]
}

export function isProxy(raw) {
  return isReactive(raw) || isReadonly(raw)
}

function createActiveObject(raw, baseHanlers) {
  if(!isObject(raw)) {
    console.warn('target 必须是一个对象')
    return raw
  }
  return new Proxy(raw, baseHanlers)
}
