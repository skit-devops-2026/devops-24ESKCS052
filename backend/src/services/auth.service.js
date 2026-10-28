import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import * as users from '../repositories/user.repository.js';
import { generateInviteCode } from '../utils/generateInviteCode.js';
import { ApiError } from '../utils/ApiError.js';


export const safeUser = u => ({
    id: u.id, name: u.name, email: u.email, role: u.role, ...(u.role === 'patient' ? { invite_code: u.invite_code } : {}),
    snooze_minutes: u.snooze_minutes, grace_minutes: u.grace_minutes
});

const tokenFor = u => jwt.sign(
    { role: u.role },
    env.JWT_SECRET,
    {
        subject: String(u.id),
        expiresIn: env.JWT_EXPIRES_IN,
        issuer: 'medcare-appbackend'
    });

export async function signup(v) {
    const passwordHash = await bcrypt.hash(v.password, env.BCRYPT_ROUNDS);
    try {
        const r = await users.createUser({
            name: v.name, email: v.email.toLowerCase(), passwordHash, role: v.role, inviteCode: v.role === 'patient' ? generateInviteCode() : null
        });
        const user = r.rows[0]; return { token: tokenFor(user), user: safeUser(user) }
    } catch (e) { if (e.code === '23505') throw new ApiError(409, 'Email already registered.'); throw e }
}
export async function login(v) {
    const r = await users.findByEmail(v.email.toLowerCase());
    const u = r.rows[0];
    if (!u || !u.is_active || !(await bcrypt.compare(v.password, u.password_hash)))
        throw new ApiError(401, 'Invalid email or password.');
    return { token: tokenFor(u), user: safeUser(u) }
}
