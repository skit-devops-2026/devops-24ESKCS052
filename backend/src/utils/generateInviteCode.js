import {randomBytes} from 'node:crypto';
export const generateInviteCode=()=>randomBytes(4).toString('hex').slice(0,8).toUpperCase();
