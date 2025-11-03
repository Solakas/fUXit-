import { GoogleGenAI, Type } from "@google/genai";
import type { ImageData, AnalysisResult, Violation } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const textAnalysisModel = 'gemini-2.5-flash';

const fileToGenerativePart = (base64: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64,
      mimeType,
    },
  };
};

export const analyzeUI = async (imageData: ImageData): Promise<AnalysisResult> => {
  const imagePart = fileToGenerativePart(imageData.base64, imageData.mimeType);

  const textAnalysisPrompt = `
You are an expert UI/UX designer. Analyze the provided app screenshot.
Your entire response must be a single JSON object.

1.  **'overallAnalysis'**: Provide a brief, overall summary of the design in Markdown format.
2.  **'scoredAnalysis'**: Provide a detailed breakdown. For each of the following categories (Whitespace, Color Palette, Typography, Accessibility, Consistency), provide:
    *   'category': The name of the category.
    *   'score': A rating from 1 to 5 (1=poor, 5=excellent).
    *   'explanation': A concise explanation for your score. Highlight positive aspects within the explanation using <good> tags.
3.  **'violations'**: Identify specific UI/UX violations. For each violation, provide its category, a concise description, and its precise x/y coordinates on the image as percentages (0-100). Pinpoint the exact location of the issue.
`;

  const response = await ai.models.generateContent({
    model: textAnalysisModel,
    contents: [{ parts: [{ text: textAnalysisPrompt }, imagePart] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallAnalysis: {
            type: Type.STRING,
            description: "A comprehensive UI/UX analysis in Markdown format."
          },
          scoredAnalysis: {
            type: Type.ARRAY,
            description: "A scored breakdown of different UI/UX categories.",
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                score: { type: Type.NUMBER, description: "Score from 1 to 5" },
                explanation: { type: Type.STRING }
              },
              required: ["category", "score", "explanation"]
            }
          },
          violations: {
            type: Type.ARRAY,
            description: "A list of specific UI/UX violations found in the image.",
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                description: { type: Type.STRING },
                coordinates: {
                  type: Type.OBJECT,
                  properties: {
                    x: { type: Type.NUMBER, description: "Percentage from left (0-100)" },
                    y: { type: Type.NUMBER, description: "Percentage from top (0-100)" }
                  },
                  required: ["x", "y"]
                }
              },
              required: ["category", "description", "coordinates"]
            }
          }
        },
        required: ["overallAnalysis", "scoredAnalysis", "violations"]
      }
    }
  });

  const result = JSON.parse(response.text);

  // Add a unique ID to each violation for React keys
  const violationsWithIds: Violation[] = result.violations.map((v: Omit<Violation, 'id'>, index: number) => ({
    ...v,
    id: index,
  }));
  
  return {
    overallAnalysis: result.overallAnalysis,
    scoredAnalysis: result.scoredAnalysis,
    violations: violationsWithIds,
  };
};
