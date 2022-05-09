
import { hasOwn } from '../shared/index'

const publicPropertiesMap = {
  $el: (i) => i.vnode.el,
  $slots: (i) =>  i.slots,
  $props: (i) =>  i.props
}


export const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    const { setupState, props } = instance

    if(hasOwn(setupState, key)){
      // setup data
      return setupState[key]
    } else if(hasOwn(props, key)) {
      // props data 
      return props[key]
    }

    const publicGetter = publicPropertiesMap[key]
    if(publicGetter) {
      return publicGetter(instance)
    }
  }
}