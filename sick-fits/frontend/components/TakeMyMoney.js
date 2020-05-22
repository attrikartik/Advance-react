import React, { Component } from 'react'
import StripeCheckout from 'react-stripe-checkout'
import { Mutation } from 'react-apollo'
import Router from 'next/router'
import NProgress from 'nprogress'
import PropTypes from 'prop-types'
import gql from  'graphql-tag'
import calcTotalPrice from '../lib/calcTotalPrice'
import Error from './ErrorMessage'
import User, { CURRENT_USER_QUERY } from './User'

const CREATE_ORDER_MUTATION = gql`
    mutation CREATE_ORDER_MUTATION($token: String!){
       createOrder(token: $token){
          id
          charge
          total
          items {
              id
              title
          }
       }
    }
`
function totalItems(cart){
    return cart.reduce( (tally, cartItem) =>
    tally + cartItem.quantity, 0 )
}
class TakeMyMoney extends Component {
    onToken = async  (res, createOrder) => {
        NProgress.start()
        console.log('CREDIT CARD response')
        console.log(res)
        // manually call the mutation, once we have stripe token
        const order = await createOrder({
            variables: {
                token: res.id
            }
        }).catch(err=>alert(err.message))
        console.log('Order from server')
        console.log(order)
        Router.push({
            pathname: '/order',
            query: { id: order.data.createOrder.id}
        })
    }

    render(){
        return(
            <User>
                {
                    ({data: { me }}) => (
                        <Mutation
                        mutation={CREATE_ORDER_MUTATION}
                        refetchQueries={[{query:CURRENT_USER_QUERY}]}
                        >
                       
                        { (createOrder)=>(

                        <StripeCheckout
                        amount={calcTotalPrice(me.cart)}                          
                        name='Sick Fits'
                        description={`Order of ${totalItems(me.cart)} Items!!!`}
                        stripeKey='pk_test_doKUiRw95WApXRgUNmgeCLil00tG8ryBnw'
                        currency='USD'
                        email={me.email}
                        token={(res) => this.onToken(res,createOrder)}
                        >
                            {this.props.children}
                        </StripeCheckout>
                        )}

                        </Mutation>
                    )
                }
            </User>

        )
    }
}

export default TakeMyMoney