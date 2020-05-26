import { mount } from 'enzyme'
import wait from 'waait'
import CreateItem, { CREATE_ITEM_MUTATION } from '../components/CreateItem'
import { MockedProvider } from 'react-apollo/test-utils';
import Router from 'next/router'
import { fakeItem } from '../lib/testUtils';
import { isType } from 'graphql';
import toJSON from 'enzyme-to-json'
// mock the global fetch API (file upload API)
const dogImage = 'https://dog.com/dog.jpg'

global.fetch = jest.fn().mockResolvedValue({
    json: () => ({
        secure_url: dogImage,
        eager: [{ secure_url: dogImage }]
    })
})

describe('<CreateItem/>', () => {
    it('renders and matches snapshot', () => {
       const wrapper = mount(
           <MockedProvider>
               <CreateItem/>
           </MockedProvider>
        )
        const form = wrapper.find('form[data-test="form"]')
        expect(toJSON(form)).toMatchSnapshot()
    })
})