// import {query} from '../config/db.js';
// export const listNotifications=id=>query('SELECT id,type,text,read,created_at FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 100',[id]);
// export const unreadCount=id=>query('SELECT COUNT(*)::int AS count FROM notifications WHERE user_id=$1 AND read=FALSE',[id]);
// export const markAllRead=id=>query('UPDATE notifications SET read=TRUE WHERE user_id=$1',[id]);
// export async function createNotification(userId,type,text,db=query){return (await db('INSERT INTO notifications(user_id,type,text) VALUES($1,$2,$3) RETURNING id,user_id,type,text,read,created_at',[userId,type,text])).rows[0]}

import { Notification } from '../models/index.js';
const shape = n => ({ ...n, id: String(n._id), user_id: String(n.user_id) });
export const listNotifications = async id => { const rows = (await Notification.find({ user_id: id }).sort({ createdAt: -1 }).limit(100).lean()).map(shape); return { rows, rowCount: rows.length }; };
export const unreadCount = async id => { const count = await Notification.countDocuments({ user_id: id, read: false }); return { rows: [{ count }], rowCount: 1 }; };
export const markAllRead = async id => Notification.updateMany({ user_id: id }, { $set: { read: true } });
export async function createNotification(userId, type, text) { const n = await Notification.create({ user_id: userId, type, text }); return shape(n.toObject()); }
