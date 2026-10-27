import {query} from '../config/db.js';
export const findByEmail=email=>query('SELECT * FROM users WHERE email=$1',[email]);
export const findPublicById=id=>query('SELECT id,name,email,role,invite_code,snooze_minutes,grace_minutes FROM users WHERE id=$1',[id]);
export const createUser=(v)=>query('INSERT INTO users(name,email,password_hash,role,invite_code) VALUES($1,$2,$3,$4,$5) RETURNING id,name,email,role,invite_code,snooze_minutes,grace_minutes',[v.name,v.email,v.passwordHash,v.role,v.inviteCode]);
export const updateSettings=(id,v)=>query('UPDATE users SET name=COALESCE($2,name),snooze_minutes=COALESCE($3,snooze_minutes),grace_minutes=COALESCE($4,grace_minutes),updated_at=NOW() WHERE id=$1 RETURNING id,name,email,role,invite_code,snooze_minutes,grace_minutes',[id,v.name??null,v.snooze_minutes??null,v.grace_minutes??null]);
