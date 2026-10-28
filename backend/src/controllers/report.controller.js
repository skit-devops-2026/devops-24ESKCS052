import * as service from '../services/report.service.js';
import * as patients from '../services/patient.service.js';
export const get = async (req, res) => {
    const id = Number(req.params.id);
    await patients.assertPatientAccess(req.user, id);
    res.json(await service.report(id, Math.min(90, Math.max(1, Number(req.query.days) || 30))))
};
