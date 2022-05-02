
import { extend } from '../shared/index'

let activeEffect;
let shouldTrack;
class ReactiveEffect {
  private _fn: any
  deps = []
  active = true
  onStop?: () => void
  // public scheduler: Function | undefined
  constructor(fn, public scheduler?) {
    this._fn = fn
  }
  run() {
    
    // 1. 收集依赖
    // shouldTrack 区分
    if(!this.active) {
      return this._fn()
    }

    shouldTrack = true
    activeEffect = this
    
    const result  = this._fn()
    // reset
    shouldTrack = false

    return result
  }
  stop() {
    if(this.active) {
      cleanupEffect(this)
      if(this.onStop) {
        this.onStop()
      }
      this.active = false
    }
  }
}

function cleanupEffect(effect) {
  effect.deps.forEach((dep:any) => {
    dep.delete(effect)
  });
  effect.deps.length = 0
}

const targetMap = new Map()

export function track(target, key) {
  if (!isTracking()) return;
  // target -> key -> dep
  let depsMap = targetMap.get(target)
  if(!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  let dep = depsMap.get(key)
  if(!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }

  // 看看 dep 之前有没有添加过，添加过的话 那么就不添加了
  if (dep.has(activeEffect)) return;

  dep.add(activeEffect);
  activeEffect.deps.push(dep);
}

export function isTracking() {
  return shouldTrack && activeEffect !== undefined;
}

export function trigger(target, key) {
  let depsMap = targetMap.get(target)
  let dep = depsMap.get(key)
  
  for(const effect of dep) {
    if(effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}

export function effect(fn, options:any = {}) {
  // fn 
  const _effect = new ReactiveEffect(fn, options.scheduler)

  // extend
  extend(_effect, options)

  _effect.run()
  const runner:any =  _effect.run.bind(_effect)

  runner.effect = _effect

  return runner
}

export function stop(runner) {
  runner.effect.stop()
}
