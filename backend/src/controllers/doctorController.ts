import fs from 'fs';
import { Request, Response } from 'express';
import {
  getHospitalForDoctor,
  getPatientByIdForDoctor,
  listConsultationNotesForPatient,
  listMyAppointments,
  listMyCarePlans,
  listMyPatients,
  listMyReports,
} from '../services/doctorService';
import { uploadDocumentForPatient } from '../services/documentService';
import { AuthError } from '../services/authService';
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

export async function getMyAppointments(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }

  try {
    const appointments = await listMyAppointments(req.user.id);
    res.status(200).json({ success: true, appointments });
  } catch (error) {
    logger.error('Fetch doctor appointments failed', error);
    res.status(500).json({ success: false, message: 'Unable to fetch appointments.' });
  }
}

export async function getMyCarePlans(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }

  try {
    const carePlans = await listMyCarePlans(req.user.id);
    res.status(200).json({ success: true, carePlans });
  } catch (error) {
    logger.error('Fetch doctor care plans failed', error);
    res.status(500).json({ success: false, message: 'Unable to fetch care plans.' });
  }
}

export async function getPatientConsultationNotes(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }

  try {
    const notes = await listConsultationNotesForPatient(req.user.id, req.params.patientId);
    if (notes === null) {
      res.status(404).json({ success: false, message: 'Patient not found for this account.' });
      return;
    }
    res.status(200).json({ success: true, notes });
  } catch (error) {
    logger.error('Fetch patient consultation notes failed', error);
    res.status(500).json({ success: false, message: 'Unable to fetch consultation notes.' });
  }
}

export async function getMyHospital(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }

  try {
    const hospital = await getHospitalForDoctor(req.user.id);
    if (!hospital) {
      res.status(404).json({ success: false, message: 'No hospital is linked to this doctor account.' });
      return;
    }
    res.status(200).json({ success: true, hospital });
  } catch (error) {
    logger.error('Fetch doctor hospital failed', error);
    res.status(500).json({ success: false, message: 'Unable to fetch hospital.' });
  }
}

export async function getMyReports(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }

  try {
    const reports = await listMyReports(req.user.id);
    res.status(200).json({ success: true, reports });
  } catch (error) {
    logger.error('Fetch doctor reports failed', error);
    res.status(500).json({ success: false, message: 'Unable to fetch reports.' });
  }
}

export async function uploadPatientReport(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }

  try {
    const report = await uploadDocumentForPatient(req.user.id, req.params.patientId, {
      name: req.body.name,
      category: req.body.category,
      file: req.file as Express.Multer.File,
    });
    res.status(201).json({ success: true, report });
  } catch (error) {
    // Every failure path here happens before any documents row is inserted
    // (the ownership check, or an unexpected DB error), so multer's
    // already-written file is guaranteed orphaned — same cleanup
    // documentValidators.ts does for its own rejections.
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) logger.error('Failed to remove orphaned upload after failed report upload', err);
      });
    }
    if (error instanceof AuthError) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    logger.error('Upload patient report failed', error);
    res.status(500).json({ success: false, message: 'Unable to upload report.' });
  }
}
