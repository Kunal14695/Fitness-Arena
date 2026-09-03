import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { ENV } from '../config/env.js';
import { validateBody } from '../middleware/validate.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

/**
 * @route POST /api/auth/register
 * @desc Register a new user and initialize streak & rank
 */
router.post('/register', validateBody(registerSchema), async (req, res, next): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ success: false, error: 'User with this email already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        streak: {
          create: {
            currentStreak: 0,
            longestStreak: 0,
            freezeCount: 1,
          },
        },
        rank: {
          create: {
            xp: 0,
            tier: 'Novice',
            badge: '🥉 Iron Novice',
            level: 1,
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    const token = jwt.sign({ userId: user.id, email: user.email }, ENV.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully! Welcome to Fitness Arena.',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/auth/login
 * @desc Authenticate user and return JWT
 */
router.post('/login', validateBody(loginSchema), async (req, res, next): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
        streak: true,
        rank: true,
      },
    });

    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, ENV.JWT_SECRET, {
      expiresIn: '30d',
    });

    const { passwordHash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/auth/me
 * @desc Get current authenticated user profile, streak, and rank
 */
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response, next): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: {
        profile: true,
        streak: true,
        rank: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    const { passwordHash, ...safeUser } = user;
    res.json({
      success: true,
      data: safeUser,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
