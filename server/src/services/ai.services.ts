import { GoogleGenerativeAI } from "@google/generative-ai";
import * as pdfjsLib from "pdfjs-dist";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const extractTextFromPDF = async (buffer: Buffer | ArrayBuffer): Promise<string> => {
  try {
    // Ensure we have a Uint8Array
    const typedArray = buffer instanceof Buffer 
      ? new Uint8Array(buffer)
      : new Uint8Array(buffer);
    
    const loadingTask = pdfjsLib.getDocument({ 
      data: typedArray,
      useWorkerFetch: false,
      isEvalSupported: false
    });
    
    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + ' ';
    }

    return fullText.trim();
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

export const detectContractType = async (text: string): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Analyze this contract text and determine its type. Common types include: Employment Contract, NDA, Service Agreement, Sales Contract, etc. Only return the contract type, nothing else.

Text: ${text.substring(0, 2000)}`; // Limit text length

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('AI detection error:', error);
    throw new Error('Failed to detect contract type');
  }
};

export const analyzeContractWithAI = async (
  contractText: string,
  tier: "free" | "premium",
  contractType: string
) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  let prompt = tier === "premium" 
    ? `Analyze this ${contractType} and provide a detailed analysis including risks, opportunities, and recommendations.`
    : `Analyze this ${contractType} and provide a basic analysis of key points and potential issues.`;

  try {
    const result = await model.generateContent(prompt + `\n\nContract: ${contractText.substring(0, 5000)}`);
    const response = await result.response;
    const analysis = response.text();

    return {
      summary: analysis,
      risks: [],
      opportunities: [],
      overallScore: 75 // Default score
    };
  } catch (error) {
    console.error('AI analysis error:', error);
    throw new Error('Failed to analyze contract');
  }
};
