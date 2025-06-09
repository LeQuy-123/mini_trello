import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

interface AuthPayload {
  uid: string;
}

export const authenticate = (
  req: Request & { uid?: string },
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.sendStatus(401);
    return;
  }
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.uid = decoded.uid;
    next();
  } catch (error) {
    res.sendStatus(403);
  }
};
