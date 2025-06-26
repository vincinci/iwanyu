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
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.id || decoded.userId },
      select: { 
        id: true, 
        email: true, 
        role: true,
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
      return res.status(401).json({ error: 'User not found' });
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
    return res.status(403).json({ error: 'Invalid token' });
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