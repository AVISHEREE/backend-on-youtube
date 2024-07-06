import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { upload } from "../middleware/multer.middleware.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { response } from "express";
import jwt from 'jsonwebtoken'

const generateAccessTokenAndRefreshToken = async (userId)=>{
   try{
      const user = await User.findById(userId);
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()
      user.refreshToken = refreshToken
     await user.save({ validateBeforeSave : false })
     return {accessToken,refreshToken}
   }
   catch(e){
      throw new ApiError(500,'something went wrong while generating access token and refresh token')
   }
}

const registerUser = asyncHandler( async (req,res) =>{
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res

    console.log('Received a POST request to /register');
    const  {fullName,email,password,userName} =  req.body
   //  console.log('email',email);
     if([fullName,email,password,userName].some((feild)=>
        feild?.trim() === ""
     )){
        throw new ApiError(400,"full name required")
     }
   const existedUser = await User.findOne({
      $or:[{userName},{email}]
     })
     if(existedUser) {
      throw new ApiError(409,"username and email already exists")
     }
    
   const avatarLocalPath = req.files?.avatar[0]?.path;
   let coverImageLocalPath = req.files?.coverImage[0]?.path;
   
   if( req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.lenght >= 0 ){
      coverImageLocalPath = req.files?.coverImage[0]?.path;
   }

   if (!avatarLocalPath) {
      throw new ApiError(409,"avatar file is required ")
   }
   console.log(avatarLocalPath,"local path for avatar")
   const avatar = await uploadOnCloudinary(avatarLocalPath)
   const coverImage = await uploadOnCloudinary(coverImageLocalPath)
      
   if (!avatar) {
      throw new ApiError(409,"avatar file is required and facing issues in uploading")
   }

  const user = await User.create({
      fullName ,
      avatar: avatar.url,
      coverImage:coverImage?.url||"",
      email,
      password,
      userName:userName.toLowerCase()
   })

   const createdUser = await User.findById(user._id).select(
      "-password -refreshToKen"
   )
   if(!createdUser){
      throw new ApiError(500,'something went wrong while registering the user')
   }

   return res.status(201).json(
      new ApiResponse(200,createdUser,'user created successfully')
   )

})

const logInUser = asyncHandler ( async (req,res) =>{
   //get password and username from frontend 
   //username and password is given in req.body -> (data)
   //find if user
   //password is correct
   //give access and refresh Token 
   //send cookies
   //send a response
   const { password , userName , email } = req.body
   if(!userName || !email){
      throw new ApiError(400,'username or email is required')
   }
   
  const user = await User.findOne({
      $or:[{userName},{email}]
   })

   if(!user){
      throw new ApiError(404,'user not exist')
   }

   const isPasswordValid = await isPasswordCorrect(password)
   if(!isPasswordValid){
      throw new ApiError(401,'password inValid')
   }

  const {accessToken,refreshToken} = await generateAccessTokenAndRefreshToken(user._id)

const logedInUser = await User.findById(user._id).select('-password -refreshToken')

const option = {
   hhtpOnly : true,
   secure:true,
}

return res
.status(200)
.cookie('accessToken',accessToken,option)
.cookie('refreshToken',refreshToken,option)
.json(
   new ApiResponse(200,{
      user: logedInUser,accessToken,refreshToken
   },
   'user logedIn successfully'
)
)
})

const logoutUser = asyncHandler( async (req,res) =>{
  User.findByIdAndUpdate(
   req.user._id,
   {
      $set:{
         refreshToken:undefined
      }
  },{
   new:true
  })
  const option = {
   hhtpOnly : true,
   secure:true,
}
return res
.status(200).clearCookie('accessToken') .clearCookie('refreshToken')
.json(new ApiResponse(200,{},'user logged out'))
}) 

const refreshAccessToken = asyncHandler(async (req,res)=>{
  try {
   const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken 
   if(!incomingRefreshToken){
    throw new ApiError(401,'refresh token not found')
   }
 
  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
   )
 
  const user = User.findById(decodedToken?._id)
 
   if(!user){
    throw new ApiError(401,'invalid refresh token')
   }
 
   if(incomingRefreshToken !== user?.refreshToken){
    throw new ApiError(401,'refresh token is expired or used')
   }
 
   const options = {
    httpOnly : true,
    secure:true
   }
 
  const {accessToken,newRefreshToken} = await generateAccessTokenAndRefreshToken(user._id)
 
   return res
   .status(200)
   .cookie('access token',accessToken,options)
   .cookie('refresh token',newRefreshToken,options)
   .json(
    new ApiResponse (
       200,
       {accessToken , refreshToken : newRefreshToken},
       'access token generated'
    )
   )
  } catch (error) {
    
  }
  throw new ApiError(401,error?.message || 'invalid refresh token')

}
)


export {
    registerUser,
    logInUser,
   logoutUser,
   refreshAccessToken
}