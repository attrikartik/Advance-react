function Person(name, foods){
    this.name = name
    this.foods = foods
}
Person.prototype.fetchFavFoods = function () {
    return new Promise((resolve,reject) => {
        // simulate an API
       setTimeout(() =>resolve(this.foods),2000)
    })
}
describe('mocking learning', () => {
    
    it('mocks a reg function',()=>{
       const fetchNames = jest.fn()
       fetchNames('Ram')
       expect(fetchNames).toHaveBeenCalled()
       expect(fetchNames).toHaveBeenCalledWith('Ram')
    })

    it('can create a person', () => {
        const me = new Person('kartik',['burger'])
        expect(me.name).toBe('kartik')
    })
    
    it('can fetch foods', async()=>{
        const me = new Person('kartik',['burger'])
        // mock the favFoods function
        me.fetchFavFoods = jest.fn().mockResolvedValue(['burger'])
        const favFoods = await me.fetchFavFoods()
        expect(favFoods).toContain('burger')
    })
})