import dotenv from 'dotenv'
import connect_db from "./db/index.js";
import app from './app.js';
dotenv.config({
    path:'./env'
})
connect_db()
.then(()=>{
    app.listen(process.env.PORT ,()=>{
        console.log(`app is listening of port : http://localhost:${process.env.PORT}`);
    })
    
})
.catch((e)=>{
    console.log("app connection failed!!")
})