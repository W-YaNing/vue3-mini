import { track, trigger } from "./effect" 
import { reactive, ReactiveFlags, readonly } from './reactive'
import { extend, isObject } from '../shared/index'

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
const shoallowReadonlyGet = createGetter(true, true)


function createGetter(isReadonly = false, shoallow = false) {
  return function get(target, key) {

    if(key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if(key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    }

    const res = Reflect.get(target, key)
    
    if(shoallow) {
      return res
    }

    if(isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res)
    }

    if(!isReadonly) {
      track(target, key)
    }
    return res
  }
}

function createSetter() {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value)
    trigger(target, key)
    return res
  }
}

export const mutableHanders = {
  get,
  set
}

export const readonlyHandlers = {
  get: readonlyGet,
  set(target, key, value) {
    console.warn(`key: ${key} is not set`)
    return true
  }
}


export const shoallowReadonlyHandlers = extend({}, readonlyHandlers, {
  get: shoallowReadonlyGet
})
