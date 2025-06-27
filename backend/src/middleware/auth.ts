import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../utils/db';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    seller?: {
      id: string;
      businessName?: string;
      status: string;
    };
  };
  userId?: string;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        code: 'TOKEN_MISSING'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ 
          error: 'Token has expired',
          code: 'TOKEN_EXPIRED'
        });
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ 
          error: 'Invalid token format',
          code: 'TOKEN_INVALID'
        });
      }
      throw error;
    }

    const tokenExp = decoded.exp ? decoded.exp * 1000 : 0;
    if (tokenExp && Date.now() > tokenExp - 300000) { // 5 minutes buffer
      return res.status(401).json({ 
        error: 'Token is about to expire',
        code: 'TOKEN_EXPIRING_SOON'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id || decoded.userId },
      select: { 
        id: true, 
        email: true, 
        role: true,
        isActive: true,
        seller: {
          select: {
            id: true,
            businessName: true,
            status: true
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        error: 'Account is inactive',
        code: 'ACCOUNT_INACTIVE'
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      seller: user.seller ? {
        id: user.seller.id,
        businessName: user.seller.businessName || undefined,
        status: user.seller.status
      } : undefined
    };
    req.userId = user.id;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      error: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

export const requireSeller = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user?.seller) {
    return res.status(403).json({ error: 'Seller account required' });
  }
  
  if (req.user.seller.status !== 'APPROVED') {
    return res.status(403).json({ error: 'Seller account must be approved' });
  }
  
  next();
};