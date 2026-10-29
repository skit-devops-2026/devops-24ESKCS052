// import pg from 'pg';
// import {env} from './env.js';
// const {Pool}=pg;
// export const pool=new Pool({connectionString:env.DATABASE_URL,max:10,idleTimeoutMillis:30000,connectionTimeoutMillis:5000});
// pool.on('error',e=>console.error('Unexpected PostgreSQL pool error:',e.message));
// export const query=(text,params=[])=>pool.query(text,params);
// export async function checkDatabaseConnection(){await query('SELECT 1')}


import mongoose from 'mongoose';
import { env } from './env.js';
export async function connectDatabase() {
    mongoose.set('strictQuery', true);
    await mongoose.connect(env.MONGODB_URI);
}
export async function checkDatabaseConnection() {
    if (mongoose.connection.readyState !== 1) throw new Error('MongoDB is not connected');
    await mongoose.connection.db.admin().ping();
}
export async function closeDatabase() {
    await mongoose.disconnect();
}