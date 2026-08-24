import { Request, Response } from 'express';
import { registerUser, loginUser, AuthError } from '../services/authService';
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
