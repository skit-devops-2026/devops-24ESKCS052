import { env } from '../config/env.js';
import { markMissedDoses } from '../services/reminder.service.js';
import { logger } from '../config/logger.js'; let timer; let running = false;
export function startReminderJob() {
    if (timer) return;
    timer = setInterval(async () => {
        if (running) return; running = true;
        try {
            const count = await markMissedDoses();
            if (count) logger.info('Missed-dose job completed', { count })
        } catch (e) {
            logger.error('Missed-dose job failed', { message: e.message })
        } finally {
            running = false
        }
    }, env.REMINDER_POLL_SECONDS * 1000);
    timer.unref()
}
export function stopReminderJob() { if (timer) clearInterval(timer); timer = undefined }
