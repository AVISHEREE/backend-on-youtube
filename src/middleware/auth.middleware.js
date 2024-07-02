import { User } from "../models/user.model";
import ApiError from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from 'jsonwebtoken'

export const veryfyJWT = asyncHandler(async (req,res,next) =>{
   try {
    const token = req.cookies ?.accessToken || req.header("Authorization")?.replace("bearer ","")
 
    if(!token){
     throw new ApiError(401,'unothorized request')
    }
 
   const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
   const user = await User.findById(decodedToken?._id).select('-password -refreshToken')
 
   if(!user){
     throw new ApiError(404,'InValid acsessToken ')
   }
 
   req.user = user;
   next()
   } catch (error) {
    throw new ApiError(401,error?.message || 'invalid accessToken')
   }

} )
