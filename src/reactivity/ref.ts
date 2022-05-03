import { hasChanged, isObject } from '../shared/index'
import { trackEffects, triggerEffects, isTracking } from './effect'
import { reactive } from './reactive'
class RefImpl{
  private _value: any
  public dep
  private _rawValue:any
  public __v_isRef = true
  constructor(value) {
    // hasChanged 里判断相等的 object.is 需要对比原对象 不应该对比reactive后的
    this._rawValue = value
    // 如果value 是对象 需要reactive
    // 如果不是 则不需要
    this._value = convert(value)
    this.dep = new Set()
  } 
  get value() {
    trackRefValue(this)
    return this._value
  }
  set value(newValue) {
    if(hasChanged(newValue, this._rawValue)) {
      this._rawValue = newValue
      // 现在set 再去触发依赖
      this._value = convert(newValue)
      triggerEffects(this.dep)
    } 
  }
}

function convert(value) {
  return isObject(value) ? reactive(value) : value
} 

function trackRefValue(ref) {
  if(isTracking()) {
    trackEffects(ref.dep)
  }
}

export function ref(value) {
  return new RefImpl(value)
}

export function isRef(ref){
  return !!ref.__v_isRef
}

export function unRef(ref) {
  return isRef(ref) ? ref.value : ref
}

export function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get(target, key) {
      return unRef(Reflect.get(target, key))
    },
    set(target, key, value) {
      if(isRef(Reflect.get(target, key)) && !isRef(value)) {
        return (target[key].value = value)
      } else {
        return Reflect.set(target, key, value)
      }
    }
  })
}
