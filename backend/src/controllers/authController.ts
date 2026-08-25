import { Request, Response } from 'express';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  requestPasswordReset,
  resetPassword as resetPasswordService,
  changePassword as changePasswordService,
  AuthError,
} from '../services/authService';
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
