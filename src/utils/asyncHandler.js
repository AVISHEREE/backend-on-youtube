const asyncHandler = (func) =>{
    (req,res,next)=>{
        Promise
        .resolve(func)
        .catch((e)=>(next(e)))
    }
}