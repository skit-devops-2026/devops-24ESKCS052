import * as service from '../services/auth.service.js';
import * as users from '../repositories/user.repository.js';
import { safeUser } from '../services/auth.service.js';
export const signup = async (req, res) => res.status(201).json(await service.signup(req.body));
export const login = async (req, res) => res.json(await service.login(req.body));
export const me = (req, res) => res.json({ user: safeUser(req.user) });
export const settings = async (req, res) => res.json({ user: (await users.updateSettings(req.user.id, req.body)).rows[0] });
