import { NextFunction, Request, Response } from "express";

export const isAuthenticated = (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized" });
};
