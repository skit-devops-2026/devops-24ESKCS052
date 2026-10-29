// import {query} from '../config/db.js';
// export const getTodayCheckin=id=>query('SELECT id,patient_id,checkin_date::text AS date,mood,note,created_at FROM checkins WHERE patient_id=$1 AND checkin_date=CURRENT_DATE',[id]);
// export const saveCheckin=(id,v)=>query('INSERT INTO checkins(patient_id,checkin_date,mood,note) VALUES($1,CURRENT_DATE,$2,$3) ON CONFLICT(patient_id,checkin_date) DO UPDATE SET mood=EXCLUDED.mood,note=EXCLUDED.note RETURNING id,patient_id,checkin_date::text AS date,mood,note',[id,v.mood,v.note]);


import { Checkin } from '../models/index.js';
const day = () => new Date().toISOString().slice(0, 10);
const shape = x => ({ ...x, id: String(x._id), patient_id: String(x.patient_id), date: x.checkin_date });
export const getTodayCheckin = async id => { const x = await Checkin.findOne({ patient_id: id, checkin_date: day() }).lean(); return { rows: x ? [shape(x)] : [], rowCount: x ? 1 : 0 }; };
export const saveCheckin = async (id, v) => { const x = await Checkin.findOneAndUpdate({ patient_id: id, checkin_date: day() }, { $set: { mood: v.mood, note: v.note }, $setOnInsert: { patient_id: id, checkin_date: day() } }, { new: true, upsert: true }).lean(); return { rows: [shape(x)], rowCount: 1 }; };
