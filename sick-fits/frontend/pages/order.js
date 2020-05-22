import React from 'react'
import PleaseSigIn from '../components/PleaseSignin'
import Order from '../components/Order'

const OrderPage = (props) => (
    <div>
    <PleaseSigIn>
      <Order id={props.query.id}/>
     </PleaseSigIn> 
  </div>
)


export default OrderPage