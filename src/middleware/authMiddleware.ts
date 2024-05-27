import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const Prisma = new PrismaClient();

export const authMiddleware = async (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ message: "Authorization header is missing" });
      return;
    }
    const token = authHeader.split(" ")[1];
    const tokenData = jwt.verify(
      token,
      process.env.SECRET_KEY as jwt.Secret
    ) as { id: string };

    const user = await Prisma.users.findFirst({
      where: {
        email: tokenData.id,
      },
    });

    const seller = await Prisma.sellers.findFirst({
      where: {
        email: tokenData.id,
      },
    });

    if (user) {
      req.user = user;
      next();
    } else if (seller) {
      req.user = seller;
      next();
    } else {
      res.status(401).json({ message: "Invalid token" });
    }
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};
