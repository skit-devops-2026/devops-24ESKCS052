import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const opts = { timestamps: true, versionKey: false };

const userSchema = new Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true, index: true },
    password_hash: { type: String, required: true },
    role: { type: String, enum: ['patient', 'caregiver'], required: true },
    invite_code: { type: String, default: null, index: true },
    is_active: { type: Boolean, default: true },
    snooze_minutes: { type: Number, default: 10 },
    grace_minutes: { type: Number, default: 45 }
}, opts);

userSchema.index({ invite_code: 1 }, { unique: true, partialFilterExpression: { invite_code: { $type: 'string' } } });

const medicineSchema = new Schema({
    patient_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    dosage: { type: String, default: '' },
    instructions: { type: String, default: '' },
    times: { type: [String], default: [] },
    stock: { type: Number, default: null },
    pills_per_dose: { type: Number, default: 1 },
    active: { type: Boolean, default: true }
}, opts);

const doseSchema = new Schema({
    medicine_id: { type: Schema.Types.ObjectId, ref: 'Medicine', required: true, index: true },
    patient_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    dose_date: { type: String, required: true, index: true },
    scheduled_time: { type: String, required: true },
    status: { type: String, enum: ['pending', 'taken', 'missed', 'skipped', 'snoozed'], default: 'pending', index: true },
    taken_at: { type: Date, default: null },
    snooze_until: { type: Date, default: null }
}, opts);
doseSchema.index({ medicine_id: 1, dose_date: 1, scheduled_time: 1 }, { unique: true });

const linkSchema = new Schema({
    patient_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    caregiver_id: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, opts);
linkSchema.index({ patient_id: 1, caregiver_id: 1 }, { unique: true });

const checkinSchema = new Schema({
    patient_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    checkin_date: { type: String, required: true },
    mood: { type: Number, required: true },
    note: { type: String, default: '' }
}, opts);
checkinSchema.index({ patient_id: 1, checkin_date: 1 }, { unique: true });

const notificationSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true },
    text: { type: String, required: true },
    read: { type: Boolean, default: false }
}, opts);

export const User = model('User', userSchema);
export const Medicine = model('Medicine', medicineSchema);
export const Dose = model('Dose', doseSchema);
export const CaregiverLink = model('CaregiverLink', linkSchema);
export const Checkin = model('Checkin', checkinSchema);
export const Notification = model('Notification', notificationSchema);
