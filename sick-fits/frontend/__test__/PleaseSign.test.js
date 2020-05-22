import { mount } from 'enzyme'
import toJSON from 'enzyme-to-json'
import wait from 'waait'
import PleaseSignIn from '../components/PleaseSignin'
import { CURRENT_USER_QUERY }  from '../components/User'
import { MockedProvider } from 'react-apollo/test-utils'
import { fakeUser } from '../lib/testUtils'

const notSignedInMocks = [
    {
        request: { query: CURRENT_USER_QUERY},
        data: { me: null}
    }
]