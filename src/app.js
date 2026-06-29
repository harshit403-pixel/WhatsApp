import cookieParser from 'cookie-parser'
import express from 'express'
import morgan from 'morgan'
import indexRouter from './routes/index.route.js'


export default function createApp() {
    
 let app = express()

//security middlewares 
app.use(morgan("dev"))
app.use(express.json())
app.use(cookieParser())


// use routes
app.use('/api', indexRouter)


return app
}



