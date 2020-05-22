import React, { Component } from 'react'
import Reset from '../components/Reset'

class ResetPage extends Component{
    render(){
        return(
            <div>
                <Reset resetToken={this.props.query.resetToken}/>
             </div>
        )
    }
}

export default ResetPage