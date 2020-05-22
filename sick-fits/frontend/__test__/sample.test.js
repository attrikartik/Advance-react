describe('sample test 101',()=>{
    it('works as expected', ()=> {
       expect(1).toEqual
    })

    it('list of names',()=> {
        const names = ['Ram','Aman','Rohit']
        expect(names).toContain('Ram')
        expect(names).toContain('Rohit')
    })
})