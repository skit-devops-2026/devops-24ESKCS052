import jwt from 'jsonwebtoken';
import {query} from '../config/db.js';
import {env} from '../config/env.js';
import {ApiError} from '../utils/ApiError.js';
export async function authenticate(req,_res,next){try{const [scheme,token]=(req.get('authorization')||'').split(' ');if(scheme!=='Bearer'||!token)throw new ApiError(401,'Authentication required.');let claims;try{claims=jwt.verify(token,env.JWT_SECRET,{issuer:'medcare-appbackend'})}catch{throw new ApiError(401,'Invalid or expired token.')}const r=await query('SELECT id,name,email,role,invite_code,is_active,snooze_minutes,grace_minutes FROM users WHERE id=$1',[claims.sub]);if(!r.rowCount||!r.rows[0].is_active)throw new ApiError(401,'Account unavailable.');req.user=r.rows[0];next()}catch(e){next(e)}}
