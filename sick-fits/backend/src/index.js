require('dotenv').config({path:'variables.env'})
const cookieParser = require('cookie-parser')
const createServer = require('./createServer')
const jwt = require('jsonwebtoken')
const db = require('./db')

const server = createServer()

// middleware to handle JWT
server.express.use(cookieParser())

// decode jwt to get user name on every request

server.express.use((req,res,next)=>{
    const {token} = req.cookies
    if(token){
        const {userId} = jwt.verify(token,process.env.APP_SECRET)
        // put user id
        req.userId = userId

    }
    next()
})

// create middleware that populates user on each request


server.express.use( async (req,res,next)=>{
    const {token} = req.cookies
    if(!req.userId){
       return next()
    }

    const user = await db.query.user({where:{id: req.userId}},'{id, name, email,permissions}')
    req.user = user
    next()
})

server.start({
    cors: {
        credentials: true,
        origin: process.env.FRONTEND_URL
    }
},deets => {
    console.log(`Server started at http:/localhost: ${deets.port}`)
})