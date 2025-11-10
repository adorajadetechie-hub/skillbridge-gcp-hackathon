import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AnalysisResult } from '../types';

// Read from Vite-injected env at build time
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

// NOTE: process.env.API_KEY is assumed to be pre-configured and accessible.
// No UI for API key input is provided as per instructions.

export const analyzeResume = async (
  resumeBase64: string,
  resumeMimeType: string,
  targetRole: string
): Promise<AnalysisResult> => {
  if (!API_KEY) {
    throw new Error("Google Gemini API_KEY is not defined. Please ensure it is available in the environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const model = "gemini-2.5-pro"; // Using gemini-2.5-pro for complex text analysis

  const systemInstruction = `You are a highly experienced career coach and resume analyst. Your task is to evaluate a candidate's resume against a specified target role. Identify any career gaps, missing skills, and suggest valuable certifications and learning resources to bridge these gaps. Your response must be in a structured JSON format.`;

  // Constructing parts for a multi-modal input.
  // The model will receive the binary resume data directly as an inlineData part.
  const contentsParts = [
    {
      inlineData: {
        mimeType: resumeMimeType,
        data: resumeBase64,
      },
    },
    {
      text: `Analyze the attached resume document thoroughly. The candidate is applying for the position of "${targetRole}".`
        + `\n\nBased on the resume content and the requirements for a "${targetRole}", provide the following:\n`
        + `- A concise "gap_summary": Summarize any significant career gaps, lack of relevant experience, or under-demonstrated skills relative to the target role.\n`
        + `- A list of "missing_skills": Enumerate specific technical and soft skills that are typically required for a "${targetRole}" but are either absent or not strongly highlighted in the resume.\n`
        + `- A list of "certifications": Suggest specific industry-recognized certifications that would significantly boost the candidate's qualification for the "${targetRole}".\n`
        + `- A list of "learning_resources": Provide actionable learning resources (e.g., URLs to online courses like Coursera, edX, Udemy; specific book titles; or reputable learning platforms) that can help the candidate acquire the identified missing skills or certifications. Prioritize direct links where appropriate.`
    },
  ];

  // Define the JSON schema for the response structure
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      gap_summary: {
        type: Type.STRING,
        description: 'A summary of missing experience or skills relevant to the target role.',
      },
      missing_skills: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'A list of technical or soft skills missing for the target role.',
      },
      certifications: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'A list of certifications that would help for the target role.',
      },
      learning_resources: {
        type: Type.ARRAY,
        items: { type: Type.STRING }, // Expecting URLs or course names
        description: 'A list of learning links or courses to address gaps.',
      },
    },
    required: ['gap_summary', 'missing_skills', 'certifications', 'learning_resources'],
    propertyOrdering: ['gap_summary', 'missing_skills', 'certifications', 'learning_resources'],
  };

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: { parts: contentsParts },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7, // Balances creativity and directness
        topK: 40,
        topP: 0.95,
      },
    });

    let jsonText = response.text.trim();

    // The model sometimes wraps JSON in markdown code blocks. Clean it if necessary.
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    }

    return JSON.parse(jsonText) as AnalysisResult;

  } catch (error: any) {
    console.error("Error analyzing resume with Gemini API:", error);
    // Generic error handling, can be expanded with retry logic
    throw new Error(`Failed to analyze resume. Please try again. Details: ${error.message || "Unknown API error"}`);
  }
};