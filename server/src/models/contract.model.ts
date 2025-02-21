import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./user.model";

interface IRisk {
  risk: string;
  explanation: string;
  severity: "low" | "medium" | "high";
}

interface IOpportunity {
  opportunity: string;
  explanation: string;
  impact: "low" | "medium" | "high";
}

interface ICompensationStructure {
  baseSalary: string;
  bonuses: string;
  equity: string;
  otherBenefits: string;
}

export interface IContractAnalysis extends Document {
  userId: mongoose.Types.ObjectId;
  contractText: string;
  contractType: string;
  summary: string;
  risks: Array<{
    description: string;
    severity: 'low' | 'medium' | 'high';
    category: string;
  }>;
  opportunities: Array<{
    description: string;
    impact: 'low' | 'medium' | 'high';
    category: string;
  }>;
  negotiationPoints: Array<{
    description: string;
    priority: 'low' | 'medium' | 'high';
    category: string;
  }>;
  overallScore: number;
  language: string;
  aiModel: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContractAnalysisSchema = new Schema<IContractAnalysis>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contractText: {
      type: String,
      required: true,
    },
    contractType: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    risks: [{
      description: {
        type: String,
        required: true,
      },
      severity: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
      },
      category: {
        type: String,
        default: 'general',
      },
    }],
    opportunities: [{
      description: {
        type: String,
        required: true,
      },
      impact: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
      },
      category: {
        type: String,
        default: 'general',
      },
    }],
    negotiationPoints: [{
      description: {
        type: String,
        required: true,
      },
      priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
      },
      category: {
        type: String,
        default: 'general',
      },
    }],
    overallScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    language: {
      type: String,
      default: 'en',
    },
    aiModel: {
      type: String,
      default: 'gemini-pro',
    },
  },
  { timestamps: true }
);

export default mongoose.model<IContractAnalysis>("ContractAnalysis", ContractAnalysisSchema);
