import {query} from '../config/db.js';
export const listNotifications=id=>query('SELECT id,type,text,read,created_at FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 100',[id]);
export const unreadCount=id=>query('SELECT COUNT(*)::int AS count FROM notifications WHERE user_id=$1 AND read=FALSE',[id]);
export const markAllRead=id=>query('UPDATE notifications SET read=TRUE WHERE user_id=$1',[id]);
export async function createNotification(userId,type,text,db=query){return (await db('INSERT INTO notifications(user_id,type,text) VALUES($1,$2,$3) RETURNING id,user_id,type,text,read,created_at',[userId,type,text])).rows[0]}
