import { Request, Response } from 'express';
import { getPatientByIdForDoctor, listMyPatients } from '../services/doctorService';
import { logger } from '../utils/logger';

export async function getMyPatients(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }

  try {
    const patients = await listMyPatients(req.user.id);
    res.status(200).json({ success: true, patients });
  } catch (error) {
    logger.error('Fetch doctor patients failed', error);
    res.status(500).json({ success: false, message: 'Unable to fetch patients.' });
  }
}

export async function getPatientDetail(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }

  try {
    const patient = await getPatientByIdForDoctor(req.user.id, req.params.patientId);
    if (!patient) {
      res.status(404).json({ success: false, message: 'Patient not found for this account.' });
      return;
    }
    res.status(200).json({ success: true, patient });
  } catch (error) {
    logger.error('Fetch doctor patient detail failed', error);
    res.status(500).json({ success: false, message: 'Unable to fetch patient.' });
  }
}
