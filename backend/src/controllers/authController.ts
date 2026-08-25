import { Request, Response } from 'express';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  updateCurrentUser,
  requestPasswordReset,
  resetPassword as resetPasswordService,
  changePassword as changePasswordService,
  AuthError,
} from '../services/authService';
import { getPrimaryEmergencyContact, upsertPrimaryEmergencyContact } from '../services/emergencyContactService';
import { getSettingsForRole, upsertSettingsForRole } from '../services/settingsService';
import { getMyChildren as getMyChildrenService } from '../services/childProfileService';
import { logger } from '../utils/logger';

export async function register(req: Request, res: Response) {
  const { email, password, role, phone, profile } = req.body;

  try {
    const { user, token, profile: createdProfile } = await registerUser(
      email,
      password,
      role,
      phone,
      profile ?? {}
    );
    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      user,
      profile: createdProfile,
      token,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    logger.error('Registration failed', error);
    res.status(500).json({ success: false, message: 'Unable to complete registration.' });
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  try {
    const { user, token } = await loginUser(email, password);
    res.status(200).json({ success: true, message: 'Login successful.', user, token });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    logger.error('Login failed', error);
    res.status(500).json({ success: false, message: 'Unable to complete login.' });
  }
}

const FORGOT_PASSWORD_MESSAGE = 'If an account exists for this email, a password reset link has been sent.';

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body;

  try {
    const { resetToken, expiresAt } = await requestPasswordReset(email);

    const response: Record<string, unknown> = {
      success: true,
      message: FORGOT_PASSWORD_MESSAGE,
    };

    // Local dev/testing only: never sent in production, and never lets the
    // response shape depend on whether the email matched an account beyond
    // this explicitly-gated debug field.
    if (process.env.NODE_ENV !== 'production' && resetToken) {
      response.devResetToken = resetToken;
      response.devResetTokenExpiresAt = expiresAt;
    }

    res.status(200).json(response);
  } catch (error) {
    logger.error('Forgot password request failed', error);
    res.status(500).json({ success: false, message: 'Unable to process password reset request.' });
  }
}

export async function resetPassword(req: Request, res: Response) {
  const { resetToken, newPassword } = req.body;

  try {
    await resetPasswordService(resetToken, newPassword);
    res.status(200).json({ success: true, message: 'Password has been reset successfully.' });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    logger.error('Reset password failed', error);
    res.status(500).json({ success: false, message: 'Unable to reset password.' });
  }
}

export async function getMe(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }

  try {
    const user = await getCurrentUser(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    logger.error('Fetch current user failed', error);
    res.status(500).json({ success: false, message: 'Unable to fetch current user.' });
  }
}

export async function updateMe(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }

  const { phone, email, profile } = req.body ?? {};

  try {
    const user = await updateCurrentUser(req.user.id, req.user.role, { phone, email, profile });
    res.status(200).json({ success: true, user });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    logger.error('Update current user failed', error);
    res.status(500).json({ success: false, message: 'Unable to update current user.' });
  }
}

export async function getMyEmergencyContact(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }

  try {
    const contact = await getPrimaryEmergencyContact(req.user.id);
    res.status(200).json({ success: true, contact });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    logger.error('Fetch emergency contact failed', error);
    res.status(500).json({ success: false, message: 'Unable to fetch emergency contact.' });
  }
}

export async function updateMyEmergencyContact(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }

  const { name, relation, phone } = req.body ?? {};

  try {
    const contact = await upsertPrimaryEmergencyContact(req.user.id, { name, relation, phone });
    res.status(200).json({ success: true, contact });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    logger.error('Update emergency contact failed', error);
    res.status(500).json({ success: false, message: 'Unable to update emergency contact.' });
  }
}

export async function getMySettings(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }

  try {
    const settings = await getSettingsForRole(req.user.id, req.user.role);
    res.status(200).json({ success: true, settings });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    logger.error('Fetch settings failed', error);
    res.status(500).json({ success: false, message: 'Unable to fetch settings.' });
  }
}

export async function updateMySettings(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }

  try {
    const settings = await upsertSettingsForRole(req.user.id, req.user.role, req.body ?? {});
    res.status(200).json({ success: true, settings });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    logger.error('Update settings failed', error);
    res.status(500).json({ success: false, message: 'Unable to update settings.' });
  }
}

export async function getMyChildren(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }

  try {
    const children = await getMyChildrenService(req.user.id);
    res.status(200).json({ success: true, children });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    logger.error('Fetch children failed', error);
    res.status(500).json({ success: false, message: 'Unable to fetch children.' });
  }
}

export async function changePassword(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Authentication token is required.' });
    return;
  }

  const { currentPassword, newPassword } = req.body;

  try {
    await changePasswordService(req.user.id, currentPassword, newPassword);
    res.status(200).json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.status).json({ success: false, message: error.message });
      return;
    }
    logger.error('Change password failed', error);
    res.status(500).json({ success: false, message: 'Unable to change password.' });
  }
}
