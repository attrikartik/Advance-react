import ItemComponent from '../components/Item'
import { shallow } from 'enzyme'
import toJSON from  'enzyme-to-json'

const fakeItem = {
    id: 'ABC123',
    title: 'A test item',
    price: 5000,
    description: 'This item is really cool',
    image: 'test.jpg',
    largeImage: 'largetest.jpg'
}

describe('<Item/>', () => {

    it('renders and matches snap0',()=>{
      const wrapper = shallow(<ItemComponent item={fakeItem}/> )
      expect(toJSON(wrapper)).toMatchSnapshot()
    })
    // it('renders image properly', ()=> {
    //     const wrapper = shallow(<ItemComponent item={fakeItem}/>)
    //     const img = wrapper.find('img')
    //     expect(img.props().src).toBe(fakeItem.image)
    //     expect(img.props().alt).toBe(fakeItem.title)
    // })

    // it('renders priceTag and title', () => {
    //     const wrapper = shallow(<ItemComponent item={fakeItem} />);
    //     //console.log(wrapper.debug())
    //     const PriceTag = wrapper.find("PriceTag")
    //     //console.log(PriceTag.dive().text())
    //     expect(PriceTag.children().text()).toBe('$50')
    //     expect(wrapper.find('Title a').text()).toBe(fakeItem.title)
    // })

    // it('renders buttons', () => {
    //     const wrapper = shallow(<ItemComponent item={fakeItem}/>)
    //     const buttonList = wrapper.find('.buttonList')
    //     expect(buttonList.children()).toHaveLength(3)
    //     expect(buttonList.find('Link')).toHaveLength(1)
    //     expect(buttonList.find('AddToCart').exists()).toBe(true)
    //     expect(buttonList.find('DeleteItem').exists()).toBe(true)
    // })
})