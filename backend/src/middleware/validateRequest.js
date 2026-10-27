import {ApiError} from '../utils/ApiError.js';
export const validateRequest=schema=>(req,_res,next)=>{const parsed=schema.safeParse({body:req.body,params:req.params,query:req.query});if(!parsed.success)return next(new ApiError(400,'Request validation failed.',parsed.error.issues));req.validated=parsed.data;next()};
