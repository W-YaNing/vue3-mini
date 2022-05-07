


import { h, getCurrentInstance } from '../../lib/guide-mini-vue.esm.js'
export const Foo = {
  setup(props) {
    const instance = getCurrentInstance()
    console.log('foo:', instance)
    return {}
  },
  
  render() {
    return h('p', {}, "foo demo")
  }
}