import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// POST /api/auth/validate-code
// Validates an alphanumeric access code (reusable)
router.post('/validate-code', async (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    // Validate input
    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid access code'
      });
    }

    // Check if code exists
    const accessCode = await prisma.accessCode.findUnique({
      where: { code },
      include: { users: true }
    });

    if (!accessCode) {
      return res.status(404).json({
        success: false,
        message: 'Invalid access code. Please check your code and try again.'
      });
    }

    // Check if code has expired
    if (accessCode.expiresAt && accessCode.expiresAt < new Date()) {
      return res.status(410).json({
        success: false,
        message: 'This access code has expired.'
      });
    }

    // Check if code has reached maximum uses
    if (accessCode.maxUses && accessCode.currentUses >= accessCode.maxUses) {
      return res.status(409).json({
        success: false,
        message: 'This access code has reached its maximum number of uses.'
      });
    }

    // Code is valid
    return res.status(200).json({
      success: true,
      message: 'Access code is valid',
      data: {
        codeId: accessCode.id,
        expiresAt: accessCode.expiresAt,
        isReusable: accessCode.isReusable
      }
    });

  } catch (error) {
    console.error('Error validating access code:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/auth/register
// Registers a new user with personal information after code validation
router.post('/register', async (req: Request, res: Response) => {
  try {
    const {
      code,
      fullName,
      email,
      organization,
      phoneNumber
    } = req.body;

    // Validate required fields
    if (!code || !fullName || !email || !organization || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: code, fullName, email, organization, phoneNumber'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Validate phone number (basic validation)
    if (phoneNumber.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid phone number'
      });
    }

    // Re-validate access code
    const accessCode = await prisma.accessCode.findUnique({
      where: { code },
      include: { users: true }
    });

    if (!accessCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid access code'
      });
    }

    // Check expiration
    if (accessCode.expiresAt && accessCode.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'This access code has expired'
      });
    }

    // Check max uses
    if (accessCode.maxUses && accessCode.currentUses >= accessCode.maxUses) {
      return res.status(400).json({
        success: false,
        message: 'This access code has reached its maximum number of uses'
      });
    }

    // Check if email is already registered
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'This email is already registered'
      });
    }

    // Create user and connect to access code
    const user = await prisma.$transaction(async (prisma) => {
      // Update access code usage count
      await prisma.accessCode.update({
        where: { id: accessCode.id },
        data: {
          currentUses: { increment: 1 }
        }
      });

      // Create user with access code connection
      return await prisma.user.create({
        data: {
          fullName,
          email,
          organization,
          phoneNumber,
          accessCodes: {
            connect: { id: accessCode.id }
          }
        }
      });
    });

    // Generate simple session token (in production, use JWT)
    const sessionToken = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

    // Create session
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token: sessionToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          organization: user.organization,
          phoneNumber: user.phoneNumber
        },
        sessionToken: session.token,
        expiresAt: session.expiresAt
      }
    });

  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/auth/logout
// Invalidates user session
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const { sessionToken } = req.body;

    if (sessionToken) {
      // Deactivate session
      await prisma.session.updateMany({
        where: { token: sessionToken },
        data: { isActive: false }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Error logging out:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/auth/session
// Validates session token and returns user info
router.get('/session', async (req: Request, res: Response) => {
  try {
    const sessionToken = req.headers.authorization?.replace('Bearer ', '');

    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        message: 'No session token provided'
      });
    }

    const session = await prisma.session.findUnique({
      where: { token: sessionToken },
      include: { user: true }
    });

    if (!session || !session.isActive || session.expiresAt < new Date()) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: session.user.id,
          fullName: session.user.fullName,
          email: session.user.email,
          organization: session.user.organization,
          phoneNumber: session.user.phoneNumber
        },
        sessionToken: session.token,
        expiresAt: session.expiresAt
      }
    });

  } catch (error) {
    console.error('Error validating session:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;