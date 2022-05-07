
import { h } from '../../lib/guide-mini-vue.esm.js'

import { Foo } from './Foo.js'

export const App = {
  // not have template
  render() {
    const app = h('span', {}, 'hi ')
    const foo = h(Foo, {}, {
      header: ({age}) => h('p', {}, 'header' + age),
      footer: () =>  h('p', {}, 'footer')
    })
    return h("div", {}, [
      app,
      foo
    ])
  },
  setup() {
    return {
      msg: 'mini-vue'
    }
  }
}