import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connect_db = async () =>{
    try{
        const connectionstr = await mongoose.connect(`${process.env.MONGOBD_URI}/${DB_NAME}`)
        console.log(`MongoDB connected connected Host : ${connectionstr.connection.host} `);
    }
    catch(e){
        console.log(`connection Error in DB : ${e} `);
        process.exit(1)
    }
}

export default connect_db