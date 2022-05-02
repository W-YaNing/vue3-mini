import { isReadonly, shoallowReadonly } from "../reactive";

describe('shoallowReadonly', () => {
  test('should not make non-reactive properties reactive', () => {
    const props = shoallowReadonly({ n: { foo: 1 }})
    expect(isReadonly(props)).toBe(true)
    expect(isReadonly(props.n)).toBe(false)
  })

  it('warn then call set', () => {
    // console.warn
    // mock
    console.warn = jest.fn()
    const user = shoallowReadonly({
      age: 10
    })
    user.age = 11
    expect(console.warn).toBeCalled()
  })

})