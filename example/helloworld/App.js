
import { h } from '../../lib/guide-mini-vue.esm.js'

export const App = {
  // not have template
  render() {
    return h("div", {
      id: "root",
      class: ['red', 'hard']
    }, [
      h('p', { class: 'red' }, 'hi'),
      h('p', { class: 'bule' }, 'mini-vue')
    ])
  },
  setup() {
    return {
      msg: 'mini-vue'
    }
  }
}