import express, { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { isAuthenticated } from "../middleware/auth";
import { handleErrors } from "../middleware/errors";
import {
  analyzeContract,
  detectAndConfirmContractType,
  getUserContracts,
  getContractByID,
  deleteContract,
} from "../controllers/contract.controller";
import multer from "multer";

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, callback) => {
    if (file.mimetype === 'application/pdf') {
      callback(null, true);
    } else {
      callback(null, false);
      callback(new Error('Only PDF files are allowed'));
    }
  }
});

// Contract routes
router.post(
  "/detect-type",
  isAuthenticated,
  upload.single('contract'),
  handleErrors(async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      // Log the file details for debugging
      console.log('File received:', {
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      });

      const result = await detectAndConfirmContractType(req, res);
      return result;
    } catch (error) {
      console.error('Contract detection error:', error);
      return res.status(500).json({ 
        error: "Failed to detect contract type",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  })
);

router.post(
  "/analyze",
  isAuthenticated,
  upload.single('contract'),
  handleErrors(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    return analyzeContract(req, res);
  })
);

router.get(
  "/user-contracts",
  isAuthenticated,
  handleErrors(getUserContracts)
);

router.get(
  "/contract/:id",
  isAuthenticated,
  handleErrors(getContractByID)
);

router.delete(
  "/contract/:id",
  isAuthenticated,
  handleErrors(deleteContract)
);

// Add error handler as middleware
router.use(((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  if (err.message === 'Only PDF files are allowed') {
    return res.status(400).json({ error: err.message });
  }
  console.error('Route error:', err);
  next(err);
}) as ErrorRequestHandler);

export default router;
