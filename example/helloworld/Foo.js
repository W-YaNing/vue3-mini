


import { h, renderSlots } from '../../lib/guide-mini-vue.esm.js'
const age = 11
export const Foo = {
  setup(props, { emit }) {
    const emitAdd = () => {
      emit('add-foo',1,2)
    }
    return {
      emitAdd
    }
  },
  
  render() {
    console.log(renderSlots(this.$slots, 'header', {
      age
    }))

    const btn = h("button", {
      onClick: this.emitAdd
    }, 'emit add')
    const foo = h("p", {}, 'foo: ' + this.count)
    
    return h('div', {}, [renderSlots(this.$slots, 'header', {
      age
    }), renderSlots(this.$slots, 'footer')])
  }
}