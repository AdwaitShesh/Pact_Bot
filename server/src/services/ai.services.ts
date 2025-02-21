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
  prompt: string
) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  // Enhanced chat prompt
  const chatPrompt = `You are an AI assistant specialized in analyzing legal contracts. You have access to the following contract text. Please provide a clear and specific response to the user's question.

Contract Text (for reference):
${contractText.substring(0, 5000)}

User Question: ${prompt}

Please provide a detailed and professional response focusing specifically on the question asked. If the question is a greeting, respond politely and ask how you can help with analyzing the contract.`;

  try {
    const result = await model.generateContent(chatPrompt);
    const response = await result.response;
    const analysis = response.text();

    return {
      summary: analysis,
      risks: analysis,
      opportunities: analysis,
      negotiationPoints: analysis,
      overallScore: 75
    };
  } catch (error) {
    console.error('AI chat error:', error);
    throw new Error('Failed to analyze contract');
  }
};
