// import * as service from '../services/notification.service.js';
// export const list = async (req, res) => res.json(await service.list(req.user.id));
// export const count = async (req, res) => res.json(await service.count(req.user.id));
// export const readAll = async (req, res) => res.json(await service.readAll(req.user.id));


import * as service from '../services/notification.service.js';
export const list = async (req, res) => res.json(await service.list(req.user.id));
export const count = async (req, res) => res.json(await service.count(req.user.id));
export const readAll = async (req, res) => res.json(await service.readAll(req.user.id));
