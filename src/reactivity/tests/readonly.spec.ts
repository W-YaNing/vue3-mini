
import { readonly, isReadonly } from '../reactive'

describe('readonly', () => {
  it('happy path', () => {
    // not set but reacive can set
    const original = { foo: 1, bar: { baz: 2 }}
    const warpped = readonly(original)
    expect(warpped).not.toBe(original)
    expect(warpped.foo).toBe(1)
    expect(isReadonly(warpped)).toBe(true)
  })


  it('warn then call set', () => {
    // console.warn
    // mock
    console.warn = jest.fn()
    const user = readonly({
      age: 10
    })
    user.age = 11
    expect(console.warn).toBeCalled()
  })

})