
import { h, createTextVNode } from '../../lib/guide-mini-vue.esm.js'

import { Foo } from './Foo.js'

export const App = {
  name: 'App',
  render() {
    return h('duv', {}, [
      h('p', {}, "currentInstance demo"),
      h(Foo)
    ])
  },
  setup() {
    const instance = getCurrentInstance()
    console.log('app:', instance)
    return {}
  }
}