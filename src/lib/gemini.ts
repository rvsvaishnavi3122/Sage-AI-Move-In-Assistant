import { GoogleGenAI, Type, GenerateContentParameters } from "@google/genai";
import { HomeItem, PersonaType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPTS = {
  'The Organizer': "You are Sage, the Organizer. Your tone is efficient, clear, and highly practical. You focus on logistics, timelines, and making sure nothing is forgotten.",
  'The Decorator': "You are Sage, the Decorator. Your tone is inspiring, aesthetic, and warm. You focus on creating a beautiful atmosphere, matching styles, and sensory details.",
  'The Budget Master': "You are Sage, the Budget Master. Your tone is savvy, resourceful, and encouraging. You focus on ROI, hidden costs, and finding high-value alternatives."
};

/**
 * Generates an essential checklist based on user preferences.
 */
export async function generateEssentials(
  city: string, 
  budget: number, 
  accommodationType: string,
  currency: string = 'INR',
  persona: PersonaType = 'The Organizer'
): Promise<HomeItem[]> {
  const prompt = `Generate a tailored home setup checklist for a ${accommodationType} in ${city} with a budget of ${currency} ${budget}.
  
  ADVENTURE SPECIFICS:
  - If "Shared Space" (PG/Co-living): Focus on personal room essentials, bedding, and laundry. Assume kitchen/fridge are shared unless specified.
  - If "Studio": Focus on multi-purpose furniture, minimalist storage, and basic cooking gear.
  - If "1BHK" or "2BHK+": Focus on room-wise division (Bedroom, Living, Kitchen) and larger setup essentials.
  
  CORE REQUIREMENTS:
  Focus on items needed within the first 48 hours for a functional, peaceful home. 
  Include estimated costs in the local currency (${currency}).
  Categorize items significantly (Bedroom, Kitchen, Bathroom, Living Room, Essentials, Utility).
  
  SCHEMA VALUES:
  1. Priority level (Critical, Must-have, Nice-to-have)
  2. Urgency score (1-10)
  3. Short reasoning (max 15 words)
  4. Tags (e.g., 'Essentials', 'Comfort', 'Safety')`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPTS[persona] + " You provide your response as a structured list of items.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              category: { 
                type: Type.STRING,
                enum: ['Bedroom', 'Kitchen', 'Bathroom', 'Living Room', 'Essentials', 'Utility']
              },
              priority: { 
                type: Type.STRING,
                enum: ['Critical', 'Must-have', 'Nice-to-have']
              },
              urgency: { type: Type.NUMBER },
              estimatedCost: { type: Type.NUMBER },
              reasoning: { type: Type.STRING },
              tags: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING } 
              }
            },
            required: ['name', 'category', 'priority', 'urgency', 'estimatedCost', 'reasoning']
          }
        }
      }
    });

    const items = JSON.parse(response.text || "[]");
    return items.map((item: any) => ({
      ...item,
      id: Math.random().toString(36).substring(7),
      completed: false
    }));
  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
}

/**
 * Chat interaction with the assistant
 */
export async function chatWithAssistant(
  message: string, 
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  persona: PersonaType = 'The Organizer',
  context?: { city?: string; budget?: number; accommodation?: string }
) {
  const systemInstruction = `
    ${SYSTEM_PROMPTS[persona]}
    Current Context: 
    City: ${context?.city || 'Not specified'}
    Budget: ${context?.budget || 'Not specified'}
    Accommodation: ${context?.accommodation || 'Not specified'}
    
    Guidelines:
    1. Keep responses concise and supportive.
    2. Reference the user's specific move context if available.
    3. Use Markdown for formatting.
    4. Mention that you are always available in the floating button if they need more help.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history.map(h => ({ role: h.role, parts: h.parts })),
        { role: 'user', parts: [{ text: message }] }
      ] as any,
      config: {
        systemInstruction: systemInstruction
      }
    });

    return response.text || "I'm here to help, but I'm having trouble thinking right now. 🌿";
  } catch (error) {
    console.error("Chat Error:", error);
    throw error;
  }
}
