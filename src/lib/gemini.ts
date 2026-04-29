import { GoogleGenAI, Type } from "@google/genai";
import { HomeItem, PersonaType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

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
  try {
    const prompt = `Generate a robust, room-by-room home setup checklist for a ${accommodationType} in ${city} with a budget of ${currency} ${budget}.
      
      CRITICAL INSTRUCTIONS:
      1. You MUST generate at least 18-24 items in total.
      2. You MUST include items for EVERY one of these categories: Bedroom, Kitchen, Bathroom, Living Room, Essentials, Utility.
      3. At least 5 items MUST be marked with priority "Critical" (for the Today view).
      4. Include universal foundation items: Water bottles, First Aid kit, Cleaning kit, Basic bedding, Toiletry kit, Extension cord, and Tool kit.
      5. Costs must be realistic for ${city} in ${currency}.
      
      Categorization:
      - Bedroom: Bedding, Pillows, Curtains, Hangers, etc.
      - Kitchen: Utensils, Cookware, Plates, Basic groceries.
      - Bathroom: Towels, Toiletries, Bucket, Mug.
      - Living Room: Seating, Lighting, Decor.
      - Essentials: Water, First Aid, Safety.
      - Utility: Cleaning supplies, Laundry items, Internet setup.
      
      Return the output as a PURE JSON ARRAY. No markdown code blocks.`;

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: SYSTEM_PROMPTS[persona] || SYSTEM_PROMPTS['The Organizer'],
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
            },
            required: ['name', 'category', 'priority', 'urgency', 'estimatedCost', 'reasoning']
          }
        }
      }
    });

    const responseText = result.text;
    const items = JSON.parse(responseText || "[]");
    
    return items.map((item: any) => ({
      ...item,
      id: Math.random().toString(36).substring(7),
      completed: false
    }));
  } catch (error) {
    console.error("Gemini API Error (Essentials):", error);
    // Return a robust fallback checklist so the user doesn't see a blank screen
    return [
      { id: 'f1', name: "Water Bottles (Pack)", category: "Essentials", priority: "Critical", urgency: 10, estimatedCost: 200, completed: false, reasoning: "Hydration is #1 priority on day one." },
      { id: 'f2', name: "Basic Bedding Set", category: "Bedroom", priority: "Critical", urgency: 10, estimatedCost: 1500, completed: false, reasoning: "You need a place to sleep tonight." },
      { id: 'f3', name: "First Aid Kit", category: "Essentials", priority: "Must-have", urgency: 8, estimatedCost: 500, completed: false, reasoning: "Safety basics for any move." },
      { id: 'f4', name: "Cleaning Supplies (Basic)", category: "Utility", priority: "Critical", urgency: 9, estimatedCost: 400, completed: false, reasoning: "Clean the space before unpacking." },
      { id: 'f5', name: "Bath Towels", category: "Bathroom", priority: "Must-have", urgency: 8, estimatedCost: 600, completed: false, reasoning: "Essential for morning routine." }
    ];
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
  try {
    const systemInstruction = `
      ${SYSTEM_PROMPTS[persona] || SYSTEM_PROMPTS['The Organizer']}
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

    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history.map(h => ({
          role: h.role,
          parts: [{ text: h.parts[0].text }]
        })),
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return result.text || "I'm here to help!";
  } catch (error) {
    console.error("Chat API Error:", error);
    return "I'm here to help, but I'm having trouble thinking right now. 🌿";
  }
}
