const asyncHandler = (func) =>{
   return (req,res,next)=>{
        Promise.resolve(func(req,res,next)).catch((e)=>(next(e)))
    }
}

export {asyncHandler}