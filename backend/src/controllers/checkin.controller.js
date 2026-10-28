import * as service from '../services/checkin.service.js';
export const today = async (req, res) => res.json(await service.today(req.user.id));
export const save = async (req, res) => res.json(await service.save(req.user.id, req.body));
