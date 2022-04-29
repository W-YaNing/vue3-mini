describe('effect', () => {
  it('happy path', () => {
    const user = reactive({
      age: 10
    })
    let nextAge;
    effect(() => {
      nextAge = user.age + 1
      console.log(nextAge)
    })
    expect(nextAge).toBe(11)

    // upadate
    user.age++
    expect(nextAge).toBe(12)
  })
})