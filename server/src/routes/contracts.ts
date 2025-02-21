import express, { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { isAuthenticated } from "../middleware/auth";
import { handleErrors } from "../middleware/errors";
import { IUser } from "../models/user.model";
import ContractAnalysisSchema from "../models/contract.model";
import { analyzeContractWithAI } from "../services/ai.services";
import multer from "multer";
import {
  analyzeContract,
  detectAndConfirmContractType,
  getUserContracts,
  getContractByID,
  deleteContract,
} from "../controllers/contract.controller";

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

router.post(
  "/:id/ask",
  isAuthenticated,
  handleErrors(async (req, res) => {
    const { id } = req.params;
    const { prompt } = req.body;
    const user = req.user as IUser;

    if (!prompt) {
      return res.status(400).json({ error: "No prompt provided" });
    }

    try {
      const contract = await ContractAnalysisSchema.findOne({
        _id: id,
        userId: user._id
      });

      if (!contract) {
        return res.status(404).json({ error: "Contract not found" });
      }

      const response = await analyzeContractWithAI(
        contract.contractText,
        prompt
      );

      return res.json({ response: response.summary });
    } catch (error) {
      console.error('AI chat error:', error);
      return res.status(500).json({ error: "Failed to process AI request" });
    }
  })
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
