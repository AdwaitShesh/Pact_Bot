import express, { Request, Response, NextFunction } from "express";
import passport from "passport";
import { isAuthenticated } from "../middleware/auth";

const router = express.Router();

// Initialize Google OAuth route
router.get(
  "/google",
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("google", {
      scope: ["profile", "email"],
      prompt: "select_account",
      accessType: "offline",
      state: Math.random().toString(36).substring(7),
    })(req, res, next);
  }
);

// Handle Google OAuth callback
router.get(
  "/google/callback",
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("google", {
      failureRedirect: `${process.env.CLIENT_URL}/login`,
      successRedirect: `${process.env.CLIENT_URL}/dashboard`,
      failureMessage: true,
    })(req, res, next);
  }
);

// Get current user
router.get(
  "/current-user",
  isAuthenticated,
  async (req: Request & { user?: any }, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({ message: "Not authenticated" });
        return;
      }
      res.status(200).json(req.user);
    } catch (error) {
      console.error("Current user error:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Logout route
router.get(
  "/logout",
  async (req: Request & { user?: any }, res: Response) => {
    try {
      await new Promise<void>((resolve, reject) => {
        req.logout((err: Error | null) => {
          if (err) reject(err);
          resolve();
        });
      });
      
      await new Promise<void>((resolve, reject) => {
        req.session.destroy((err: Error | null) => {
          if (err) reject(err);
          resolve();
        });
      });

      res.redirect(process.env.CLIENT_URL as string);
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Server error during logout" });
    }
  }
);

export default router;
