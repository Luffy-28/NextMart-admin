import {GoogleGenAi} from "@google/genai"
import { config } from "../config/config.js"




const ai = new GoogleGenAi({apiKey: config.geminai.geminiApiKey})

export async function createEmbedding(text){
    try {
        const embedding = await ai.models.emedContent({
            model:"gemini-embedding-2",
            context: text,
        })
        return embedding.embeddings[0].values;
        
    } catch (error) {
        console.log(`Embedding generation failed: ${error}`)
        return null;
    }
}


