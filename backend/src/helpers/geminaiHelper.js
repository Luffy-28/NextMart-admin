import { GoogleGenAI } from "@google/genai";
import { config } from "../config/config.js";

const ai = new GoogleGenAI({ apiKey: config.geminai.geminiApiKey });

export async function createEmbedding(text) {
  try {
    const result = await ai.models.embedContent({
      model: "gemini-embedding-001",   // confirmed available model
      contents: text,
    });
    // SDK response shape: { embeddings: [{ values: Float32Array }] }
    const values = result?.embeddings?.[0]?.values;
    if (!values || values.length === 0) {
      console.log("Embedding returned empty values");
      return null;
    }
    return Array.from(values); // ensure plain JS array for Mongoose
  } catch (error) {
    console.log(`Embedding generation failed: ${error}`);
    return null;
  }
}

