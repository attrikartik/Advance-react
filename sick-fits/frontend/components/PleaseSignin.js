import {Query} from 'react-apollo'
import {CURRENT_USER_QUERY} from './User'
import Sigin from './Sigin'

const PleaseSignin = props => (
        <Query query={CURRENT_USER_QUERY}>
        {
            ({data,loading})=>{
                if(loading) return <p>Loading...!!!</p>
                if(!data.me)
                return(
                    <div>
                     <p> Please login</p>
                     <Sigin/>
                    </div>
                )
                return props.children
            }
        }
        </Query>
)
export default PleaseSignin
export { CURRENT_USER_QUERY }