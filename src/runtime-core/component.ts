import { PublicInstanceProxyHandlers } from './componentPublicInstance'
import { initProps } from './componentProps'
import { shoallowReadonly } from '../reactivity/reactive'
import { emit } from './componentEmit'

export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    el: null,
    props: {},
    emit
  }

  component.emit = emit.bind(null, component)

  return component
}

export function setupComponent(instance) {
  // TODO:
  initProps(instance, instance.vnode.props)
  // initSlots
  setupSatefulComponent(instance)
}

function setupSatefulComponent(instance) {
  const Component = instance.type

  instance.proxy = new Proxy({ _ : instance}, PublicInstanceProxyHandlers)

  const { setup } = Component

  if(setup) {
    const setupResult = setup(shoallowReadonly(instance.props), {
      emit: instance.emit
    })
    handleSetupResult(instance, setupResult)
  }

}

function handleSetupResult(instance, setupResult) {
  // function object
  // TODO function 
  if(typeof setupResult === 'object') {
    instance.setupState = setupResult
  }

  finishComponentSetup(instance)
}

function finishComponentSetup(instance) {
  const Component = instance.type

  instance.render = Component.render

}