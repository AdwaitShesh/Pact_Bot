import { Request, Response } from "express";
import multer from "multer";
import { IUser } from "../models/user.model";
import redis, { safeRedisOperation } from "../config/redis";
import {
  analyzeContractWithAI,
  detectContractType,
  extractTextFromPDF,
} from "../services/ai.services";
import ContractAnalysisSchema, {
  IContractAnalysis,
} from "../models/contract.model";
import mongoose, { FilterQuery } from "mongoose";
import { isValidMongoId } from "../utils/mongoUtils";

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(null, false);
      cb(new Error("Only pdf files are allowed"));
    }
  },
}).single("contract");

export const uploadMiddleware = upload;

export const detectAndConfirmContractType = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Try to detect contract type directly from buffer
    try {
      // Extract text from PDF directly
      const pdfText = await extractTextFromPDF(req.file.buffer);
      
      if (!pdfText || pdfText.trim().length === 0) {
        return res.status(400).json({ error: "Could not extract text from PDF" });
      }

      // Detect contract type
      const detectedType = await detectContractType(pdfText);
      return res.json({ detectedType });

    } catch (processingError) {
      console.error('Processing error:', processingError);
      return res.status(500).json({ 
        error: "Failed to process contract",
        details: processingError instanceof Error ? processingError.message : 'Unknown error'
      });
    }
  } catch (error) {
    console.error('Contract detection error:', error);
    return res.status(500).json({ 
      error: "Failed to detect contract type",
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const analyzeContract = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  const { contractType } = req.body;

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (!contractType) {
      return res.status(400).json({ error: "No contract type provided" });
    }

    console.log('Processing file:', {
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // Extract text directly from the buffer
    const pdfText = await extractTextFromPDF(req.file.buffer);
    
    if (!pdfText || pdfText.trim().length === 0) {
      return res.status(400).json({ error: "Could not extract text from PDF" });
    }

    // Analyze the contract with AI
    const analysis = await analyzeContractWithAI(pdfText, contractType);
    
    if (!analysis) {
      throw new Error("Failed to get analysis from AI service");
    }

    // Format the analysis results with proper structure
    const formattedAnalysis = {
      userId: user._id,
      contractText: pdfText,
      contractType,
      summary: analysis.summary || 'No summary available',
      risks: analysis.risks ? [{
        description: analysis.risks,
        severity: 'medium',
        category: 'general'
      }] : [],
      opportunities: analysis.opportunities ? [{
        description: analysis.opportunities,
        impact: 'medium',
        category: 'general'
      }] : [],
      negotiationPoints: analysis.negotiationPoints ? [{
        description: analysis.negotiationPoints,
        priority: 'medium',
        category: 'general'
      }] : [],
      overallScore: analysis.overallScore || 75,
      language: "en",
      aiModel: "gemini-pro",
    };

    // Validate the analysis before saving
    const savedAnalysis = await ContractAnalysisSchema.create(formattedAnalysis);
    
    // Cache the analysis result
    await safeRedisOperation(async () => {
      if (redis) {
        await redis.set(`contract:${savedAnalysis._id}`, JSON.stringify(savedAnalysis));
      }
    });

    console.log('Analysis completed successfully:', savedAnalysis._id);
    return res.status(200).json(savedAnalysis);
  } catch (error) {
    console.error('Contract analysis error:', error);
    return res.status(500).json({ 
      error: "Failed to analyze contract", 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

export const getUserContracts = async (req: Request, res: Response) => {
  const user = req.user as IUser;

  try {
    interface QueryType {
      userId: mongoose.Types.ObjectId;
    }

    const query: QueryType = { userId: user._id as mongoose.Types.ObjectId };
    const contracts = await ContractAnalysisSchema.find(
      query as FilterQuery<IContractAnalysis>
    ).sort({ createdAt: -1 });

    res.json(contracts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to get contracts" });
  }
};

export const getContractByID = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user as IUser;

  try {
    // Try to get from cache first using safeRedisOperation
    const cachedContract = await safeRedisOperation(async () => {
      if (redis) {
        const result = await redis.get(`contract:${id}`);
        // Return null if no cached data
        return result ? result.toString() : null;
      }
      return null;
    });

    if (cachedContract) {
      try {
        const parsedContract = JSON.parse(cachedContract);
        return res.json(parsedContract);
      } catch (parseError) {
        console.warn('Failed to parse cached contract:', parseError);
        // Continue to fetch from database if cache parsing fails
      }
    }

    // If not in cache or cache parsing failed, get from database
    const contract = await ContractAnalysisSchema.findOne({ 
      _id: id, 
      userId: user._id 
    });

    if (!contract) {
      return res.status(404).json({ error: "Contract not found" });
    }

    // Cache the result using safeRedisOperation
    await safeRedisOperation(async () => {
      if (redis) {
        await redis.set(`contract:${id}`, JSON.stringify(contract), { ex: 3600 });
      }
    });

    return res.json(contract);
  } catch (error) {
    console.error("Error fetching contract:", error);
    return res.status(500).json({ error: "Failed to fetch contract" });
  }
};

export const deleteContract = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user as IUser;

  try {
    // First check if contract exists and belongs to user
    const contract = await ContractAnalysisSchema.findOne({ 
      _id: id, 
      userId: user._id 
    });
    
    if (!contract) {
      return res.status(404).json({ error: "Contract not found" });
    }

    // Delete from database
    await ContractAnalysisSchema.findByIdAndDelete(id);
    
    // Use the safeRedisOperation helper
    await safeRedisOperation(async () => {
      if (redis) {
        await redis.del(`contract:${id}`);
      }
    });
    
    return res.status(200).json({ message: "Contract deleted successfully" });
  } catch (error) {
    console.error("Error deleting contract:", error);
    return res.status(500).json({ error: "Failed to delete contract" });
  }
};
