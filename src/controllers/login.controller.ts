import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import Joi from 'joi';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const prisma = new PrismaClient();
if (!process.env.JWT_SECRET) {
  process.exit(1); 
}
const JWT_SECRET = process.env.JWT_SECRET;

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});


export const loginUser: RequestHandler = async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);

    if (error) {
      res.status(400).json({ error: 'Invalid request data.' });
      return;
    }
    
    const { email, password } = value;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({
      error: 'Authentication required. Please log in to access this resource.'
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err instanceof jwt.TokenExpiredError) {
        res.status(401).json({ error: 'Token expired. Please log in again.' });
      } else {
        res.status(403).json({ error: 'Invalid token. Please ensure you are logged in.' });
      }
      return;
    }

    req.user = decoded as JwtPayload;
    next();
  });
};


