// const asyncHandler = (func) =>{
//    return (req,res,next)=>{
//     console.log(`asyncHandler ${req}`);
//         Promise.resolve(func(req,res,next)).catch((e)=>(next(e)))
//     }
// }

const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        console.log(`asyncHandler ${req}`);
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}


export {asyncHandler}