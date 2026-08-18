import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  try {
    const response = await ai.models.embedContent({
      model: 'gemini-embedding-2',
      contents: 'Hello world',
      config: {
        outputDimensionality: 768
      }
    });
    console.log("gemini-embedding-2 success:", response.embeddings[0].values.length);
  } catch (e) {
    console.error("gemini-embedding-2 error:", e.message);
  }
}

run();
