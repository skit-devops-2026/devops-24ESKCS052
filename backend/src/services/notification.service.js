// import * as repo from '../repositories/notification.repository.js';
// export const list = id => repo.listNotifications(id).then(r => r.rows);
// export const count = id => repo.unreadCount(id).then(r => r.rows[0]);
// export const readAll = id => repo.markAllRead(id).then(() => ({ ok: true }));


import * as repo from '../repositories/notification.repository.js';
export const list = id => repo.listNotifications(id).then(r => r.rows);
export const count = id => repo.unreadCount(id).then(r => r.rows[0]);
export const readAll = async id => { await repo.markAllRead(id); return { ok: true } };
