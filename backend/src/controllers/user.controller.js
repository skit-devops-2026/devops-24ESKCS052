import * as users from '../repositories/user.repository.js';
export const settings = async (req, res) => res.json({ user: (await users.updateSettings(req.user.id, req.body)).rows[0] });
