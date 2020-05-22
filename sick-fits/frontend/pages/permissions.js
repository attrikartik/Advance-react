import React, { Component } from 'react'
import PleaseSigIn from '../components/PleaseSignin'
import Permissions from '../components/Permissions'

const Permission = props => (
    <div>
        <PleaseSigIn>
           <Permissions/>
        </PleaseSigIn>
    </div>
)

export default Permission