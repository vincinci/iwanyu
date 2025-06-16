import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../utils/db';
import { authenticateToken } from '../middleware/auth';
import brevoService from '../services/brevoService';
import cartAbandonmentService from '../services/cartAbandonmentService';
import emailAutomationService from '../services/emailAutomationService';

const router = express.Router();

// Store password reset tokens in memory (in production, use Redis or database)
const resetTokens = new Map<string, { userId: string; expires: Date }>();

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, username, phone } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        username,
        phone,
        name: `${firstName} ${lastName}`.trim()
      }
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Trigger welcome email series
    await emailAutomationService.triggerWorkflow('welcome-series', 'user-registered', {
      userId: user.id,
      email: user.email,
      name: user.name || user.firstName,
      firstName: user.firstName
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.password) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Track cart abandonment on login
    await cartAbandonmentService.onUserLogin(user.id);

    // Check for inactive users and trigger win-back if needed
    const lastLogin = user.lastLoginAt || user.createdAt;
    const daysSinceLastLogin = Math.floor((Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastLogin >= 30) {
      await emailAutomationService.triggerWorkflow('win-back', `user-inactive-${daysSinceLastLogin >= 90 ? '90' : daysSinceLastLogin >= 60 ? '60' : '30'}days`, {
        userId: user.id,
        email: user.email,
        name: user.name || user.firstName
      }, { daysInactive: daysSinceLastLogin });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Forgot Password
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      res.json({ message: 'If an account with that email exists, we have sent a password reset link.' });
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour from now

    // Store token (in production, store in database)
    resetTokens.set(resetToken, { userId: user.id, expires });

    // Send password reset email
    try {
      await brevoService.sendPasswordResetEmail(user.email, resetToken);
      console.log('✅ Password reset email sent to:', user.email);
    } catch (emailError) {
      console.error('❌ Failed to send password reset email:', emailError);
      // Continue anyway for security reasons
    }

    // For development, also log the token
    if (process.env.NODE_ENV === 'development') {
      console.log(`Password reset token for ${email}: ${resetToken}`);
      console.log(`Reset link: http://localhost:3000/reset-password?token=${resetToken}`);
    }

    res.json({ 
      message: 'If an account with that email exists, we have sent a password reset link.',
      // Remove this in production - only for testing
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Reset Password
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      res.status(400).json({ error: 'Token and password are required' });
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long' });
      return;
    }

    // Check if token exists and is valid
    const tokenData = resetTokens.get(token);
    if (!tokenData) {
      res.status(400).json({ error: 'Invalid or expired reset token' });
      return;
    }

    // Check if token has expired
    if (new Date() > tokenData.expires) {
      resetTokens.delete(token);
      res.status(400).json({ error: 'Reset token has expired' });
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password
    await prisma.user.update({
      where: { id: tokenData.userId },
      data: { password: hashedPassword }
    });

    // Remove used token
    resetTokens.delete(token);

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Verify Reset Token
router.get('/verify-reset-token/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const tokenData = resetTokens.get(token);
    if (!tokenData) {
      res.status(400).json({ error: 'Invalid reset token' });
      return;
    }

    if (new Date() > tokenData.expires) {
      resetTokens.delete(token);
      res.status(400).json({ error: 'Reset token has expired' });
      return;
    }

    res.json({ message: 'Token is valid' });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ error: 'Failed to verify token' });
  }
});

// Validate Token
router.get('/validate', authenticateToken, async (req: any, res: Response) => {
  try {
    // If we reach here, the token is valid (middleware passed)
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    // Get fresh user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        role: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      res.status(401).json({ error: 'User not found or inactive' });
      return;
    }

    // Generate a new token with extended expiration for active users
    const newToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      valid: true,
      user,
      token: newToken // Return new token with extended expiration
    });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router; 