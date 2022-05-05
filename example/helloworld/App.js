
import { h } from '../../lib/guide-mini-vue.esm.js'


window.that = null
export const App = {
  // not have template
  render() {
    that = this
    setTimeout(() => {
      console.log(that.$el)
    })
    return h("div", {
      id: "root",
      class: ['red', 'hard']
    }, 'hi ' + that.msg)
  },
  setup() {
    return {
      msg: 'mini-vue'
    }
  }
}