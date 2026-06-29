import { Router } from "express";
import  authRouter from "./auth.routes.js";


const indexRouter = Router()

indexRouter.use("/auth", authRouter)
indexRouter.get("/",(req,res)=>{
    res.json({
        message:"trhishosiahfh sdjkf"
    })
})



export default indexRouter 