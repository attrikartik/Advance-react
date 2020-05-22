import React, {Component} from 'react'
import gql from 'graphql-tag'
import {Mutation} from 'react-apollo'
import { ALL_ITEMS_QUERY } from './Items'
const DELETE_ITEM_MUTATION =gql`
   mutation DELETE_ITEM_MUTATION ($id: ID!){
       deleteItem(id: $id){
           id
       }
   }
`

class DeleteItem extends Component{

    update = (cache, payload) =>{
        // manually upload the cache on front end
        
        // read the cache for the items we want
        const data = cache.readQuery({query: ALL_ITEMS_QUERY})
        // filter the deleted item from page
        data.items = data.items.filter(item => item.id !== payload.data.deleteItem.id)
        // put items back
        cache.writeQuery({query: ALL_ITEMS_QUERY, data})
    }
    render(){
        return(
          <Mutation 
            mutation={DELETE_ITEM_MUTATION}
            variables={{id: this.props.id}}
            update={this.update}>
                { (deleteItem,{error})=>(
               <button 
               
                onClick={()=>{
                    if(confirm('Are you sure You want to delete it!!!')){
                        deleteItem()
                    }
                }}
               
               >{this.props.children}</button>
                )}
          </Mutation>
        )
    }
}

export default DeleteItem