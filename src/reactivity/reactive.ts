import { mutableHanders, readonlyHandlers } from './baseHanlers'

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

export function isReactive(raw) {
  return !!raw[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(raw) {
  return !!raw[ReactiveFlags.IS_READONLY]
}

function createActiveObject(raw, baseHanlers) {
  return new Proxy(raw, baseHanlers)
}
