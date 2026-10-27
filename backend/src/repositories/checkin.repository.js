import {query} from '../config/db.js';
export const getTodayCheckin=id=>query('SELECT id,patient_id,checkin_date::text AS date,mood,note,created_at FROM checkins WHERE patient_id=$1 AND checkin_date=CURRENT_DATE',[id]);
export const saveCheckin=(id,v)=>query('INSERT INTO checkins(patient_id,checkin_date,mood,note) VALUES($1,CURRENT_DATE,$2,$3) ON CONFLICT(patient_id,checkin_date) DO UPDATE SET mood=EXCLUDED.mood,note=EXCLUDED.note RETURNING id,patient_id,checkin_date::text AS date,mood,note',[id,v.mood,v.note]);
