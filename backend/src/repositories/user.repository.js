// import {query} from '../config/db.js';
// export const findByEmail=email=>query('SELECT * FROM users WHERE email=$1',[email]);
// export const findPublicById=id=>query('SELECT id,name,email,role,invite_code,snooze_minutes,grace_minutes FROM users WHERE id=$1',[id]);
// export const createUser=(v)=>query('INSERT INTO users(name,email,password_hash,role,invite_code) VALUES($1,$2,$3,$4,$5) RETURNING id,name,email,role,invite_code,snooze_minutes,grace_minutes',[v.name,v.email,v.passwordHash,v.role,v.inviteCode]);
// export const updateSettings=(id,v)=>query('UPDATE users SET name=COALESCE($2,name),snooze_minutes=COALESCE($3,snooze_minutes),grace_minutes=COALESCE($4,grace_minutes),updated_at=NOW() WHERE id=$1 RETURNING id,name,email,role,invite_code,snooze_minutes,grace_minutes',[id,v.name??null,v.snooze_minutes??null,v.grace_minutes??null]);


import { User } from '../models/index.js';
const pub = u => u ? ({ ...u, id: String(u._id), _id: undefined }) : u;
export const findByEmail = async email => { const u = await User.findOne({ email }).lean(); return { rows: u ? [u] : [], rowCount: u ? 1 : 0 }; };
export const findPublicById = async id => { const u = await User.findById(id).select('name email role invite_code snooze_minutes grace_minutes').lean(); return { rows: u ? [pub(u)] : [], rowCount: u ? 1 : 0 }; };
export const createUser = async v => { const u = await User.create({ name: v.name, email: v.email, password_hash: v.passwordHash, role: v.role, invite_code: v.inviteCode }); return { rows: [{ id: String(u._id), name: u.name, email: u.email, role: u.role, invite_code: u.invite_code, snooze_minutes: u.snooze_minutes, grace_minutes: u.grace_minutes }], rowCount: 1 }; };
export const updateSettings = async (id, v) => { const u = await User.findByIdAndUpdate(id, { $set: { ...(v.name !== undefined ? { name: v.name } : {}), ...(v.snooze_minutes !== undefined ? { snooze_minutes: v.snooze_minutes } : {}), ...(v.grace_minutes !== undefined ? { grace_minutes: v.grace_minutes } : {}) } }, { new: true }).select('name email role invite_code snooze_minutes grace_minutes').lean(); return { rows: u ? [{ ...u, id: String(u._id) }] : [], rowCount: u ? 1 : 0 }; };
