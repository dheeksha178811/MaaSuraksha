import { Request, Response } from 'express';
import { listMyGrowthMeasurements, logMyGrowthMeasurement } from '../services/growthMeasurementService';
import { listMyMilestones, markMyMilestoneAchieved } from '../services/milestoneService';
import { listMyVaccinations, toggleMyVaccinationReminder } from '../services/vaccinationService';
import { listMyDailyGoals, incrementMyDailyGoal, decrementMyDailyGoal } from '../services/dailyGoalService';
import { listMyNutritionReminders, toggleMyNutritionReminder } from '../services/nutritionReminderService';
import { listMyAppointments, requestMyAppointment, cancelMyAppointment, rescheduleMyAppointment } from '../services/appointmentService';
import { listDocumentsForMother } from '../services/documentService';
import { AuthError } from '../services/authService';
import { logger } from '../utils/logger';

export async function getMyGrowthMeasurements(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }

  try {
    const measurements = await listMyGrowthMeasurements(req.user.id);
    res.status(200).json({ success: true, measurements });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    logger.error('Fetch growth measurements failed', error);
    res.status(500).json({ success: false, message: 'Unable to fetch growth measurements.' });
  }
}

export async function logGrowthMeasurement(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }

  const { recipientType, childId, date, weightKg, heightCm, headCircumferenceCm, notes } = req.body ?? {};

  try {
    const measurement = await logMyGrowthMeasurement(req.user.id, {
      recipientType,
      childId,
      measuredOn: date,
      weightKg,
      heightCm,
      headCircumferenceCm,
      notes,
    });
    res.status(201).json({ success: true, measurement });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    logger.error('Log growth measurement failed', error);
    res.status(500).json({ success: false, message: 'Unable to log growth measurement.' });
  }
}

export async function getMyMilestones(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }

  try {
    const milestones = await listMyMilestones(req.user.id);
    res.status(200).json({ success: true, milestones });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    logger.error('Fetch milestones failed', error);
    res.status(500).json({ success: false, message: 'Unable to fetch milestones.' });
  }
}

export async function markMilestoneAchieved(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }

  try {
    const milestone = await markMyMilestoneAchieved(req.user.id, req.params.milestoneId);
    res.status(200).json({ success: true, milestone });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    logger.error('Mark milestone achieved failed', error);
    res.status(500).json({ success: false, message: 'Unable to mark milestone achieved.' });
  }
}

export async function getMyVaccinations(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }

  try {
    const vaccinations = await listMyVaccinations(req.user.id);
    res.status(200).json({ success: true, vaccinations });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    logger.error('Fetch vaccinations failed', error);
    res.status(500).json({ success: false, message: 'Unable to fetch vaccinations.' });
  }
}

export async function toggleVaccinationReminder(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }

  try {
    const vaccination = await toggleMyVaccinationReminder(req.user.id, req.params.vaccinationId);
    res.status(200).json({ success: true, vaccination });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    logger.error('Toggle vaccination reminder failed', error);
    res.status(500).json({ success: false, message: 'Unable to toggle vaccination reminder.' });
  }
}

export async function getMyDailyGoals(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }

  try {
    const goals = await listMyDailyGoals(req.user.id);
    res.status(200).json({ success: true, goals });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    logger.error('Fetch daily goals failed', error);
    res.status(500).json({ success: false, message: 'Unable to fetch daily goals.' });
  }
}

export async function incrementDailyGoal(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }

  try {
    const goal = await incrementMyDailyGoal(req.user.id, req.params.goalId);
    res.status(200).json({ success: true, goal });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    logger.error('Increment daily goal failed', error);
    res.status(500).json({ success: false, message: 'Unable to increment daily goal.' });
  }
}

export async function decrementDailyGoal(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }

  try {
    const goal = await decrementMyDailyGoal(req.user.id, req.params.goalId);
    res.status(200).json({ success: true, goal });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    logger.error('Decrement daily goal failed', error);
    res.status(500).json({ success: false, message: 'Unable to decrement daily goal.' });
  }
}

export async function getMyNutritionReminders(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }

  try {
    const reminders = await listMyNutritionReminders(req.user.id);
    res.status(200).json({ success: true, reminders });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    logger.error('Fetch nutrition reminders failed', error);
    res.status(500).json({ success: false, message: 'Unable to fetch nutrition reminders.' });
  }
}

export async function toggleNutritionReminder(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }

  try {
    const reminder = await toggleMyNutritionReminder(req.user.id, req.params.reminderId);
    res.status(200).json({ success: true, reminder });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    logger.error('Toggle nutrition reminder failed', error);
    res.status(500).json({ success: false, message: 'Unable to toggle nutrition reminder.' });
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
    if (error instanceof AuthError) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    logger.error('Fetch appointments failed', error);
    res.status(500).json({ success: false, message: 'Unable to fetch appointments.' });
  }
}

export async function requestAppointment(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }

  const { category, reason, preferredDate, preferredTime } = req.body ?? {};

  try {
    const appointment = await requestMyAppointment(req.user.id, {
      category,
      reason,
      apptDate: preferredDate,
      apptTime: preferredTime,
    });
    res.status(201).json({ success: true, appointment });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    logger.error('Request appointment failed', error);
    res.status(500).json({ success: false, message: 'Unable to request appointment.' });
  }
}

export async function cancelAppointment(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }

  try {
    const appointment = await cancelMyAppointment(req.user.id, req.params.appointmentId);
    res.status(200).json({ success: true, appointment });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    logger.error('Cancel appointment failed', error);
    res.status(500).json({ success: false, message: 'Unable to cancel appointment.' });
  }
}

export async function rescheduleAppointment(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }

  const { newDate, newTime } = req.body ?? {};

  try {
    const appointment = await rescheduleMyAppointment(req.user.id, req.params.appointmentId, newDate, newTime);
    res.status(200).json({ success: true, appointment });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    logger.error('Reschedule appointment failed', error);
    res.status(500).json({ success: false, message: 'Unable to reschedule appointment.' });
  }
}

export async function getMyDocuments(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }

  try {
    const documents = await listDocumentsForMother(req.user.id);
    res.status(200).json({ success: true, documents });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    logger.error('Fetch documents failed', error);
    res.status(500).json({ success: false, message: 'Unable to fetch documents.' });
  }
}
