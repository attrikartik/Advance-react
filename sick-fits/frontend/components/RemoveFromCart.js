import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { CURRENT_USER_QUERY } from './User'

const REMOVE_FROM_CART_MUTATION = gql`
    mutation REMOVE_FROM_CART_MUTATION($id: ID!){
       removeFromCart(id: $id){
         id
       }
   }
`
const BigButton = styled.button`
  font-size: 3rem;
  background: none;
  border: 0;
  &:hover{
      color: ${ props => props.theme.red };
      cursor: pointer
  }
`
class RemoveFromCart extends Component {
    static propTypes = {
        id: PropTypes.string.isRequired
    }
    /** gets called from as soon as we get a response from server
     *  after mutation has been performed
     *  @param cache:  apollo cache
     * @param payload: response from server ( eg id i this mutation )
     */
    update = (cache, payload) => {
        // read cache
        const data = cache.readQuery({
            query: CURRENT_USER_QUERY
        })
        // remove item fro item
        const cartItemId = payload.data.removeFromCart.id
        data.me.cart = data.me.cart.filter(item => item.id !== cartItemId) 
        // write it back to cache    
        cache.writeQuery({
            query: CURRENT_USER_QUERY,
            data: data
        })
    }
    render () {
       return(
           <Mutation mutation={REMOVE_FROM_CART_MUTATION}
           variables={{
               id: this.props.id
           }}
           update={this.update}
           optimisticResponse={{
               __typename: 'Mutation',
               removeFromCart: {
                   __typename: 'CartItem',
                   id: this.props.id
               }
           }}
           >
            {
                (removeFromCart,{loading,error})=>(
                    <BigButton 
                      title="Delete Item"
                      onClick={()=>{
                          removeFromCart().catch(err=> alert(err.message))
                      }}
                      disabled={loading}
                      >
                     &times;
                    </BigButton>
                )
            }
           </Mutation>
           
       )     
    }
}

export default RemoveFromCart