
import { h } from '../../lib/guide-mini-vue.esm.js'

import { Foo } from './Foo.js'

window.that = null
export const App = {
  // not have template
  render() {
    that = this
    setTimeout(() => {
      console.log(that.$el)
    })
    return h("div", {}, [
      h('span', {}, 'hi ' + that.msg),
      h(Foo, {
        count: 1,
        onAdd(a, b) {
        },
        onAddFoo(c,v) {
          console.log('onAddFoo' + c, v)
        }
      })
    ])
  },
  setup() {
    return {
      msg: 'mini-vue'
    }
  }
}