import { HomeItem, PersonaType } from "../types";

/**
 * Generates an essential checklist based on user preferences via the backend API.
 */
export async function generateEssentials(
  city: string, 
  budget: number, 
  accommodationType: string,
  currency: string = 'INR',
  persona: PersonaType = 'The Organizer'
): Promise<HomeItem[]> {
  try {
    const response = await fetch("/api/generate-essentials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city, budget, accommodationType, currency, persona }),
    });

    if (!response.ok) throw new Error("Failed to generate essentials");

    const items = await response.json();
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
 * Chat interaction with the assistant via the backend API
 */
export async function chatWithAssistant(
  message: string, 
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  persona: PersonaType = 'The Organizer',
  context?: { city?: string; budget?: number; accommodation?: string }
) {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history, persona, context }),
    });

    if (!response.ok) throw new Error("Failed to chat");

    const data = await response.json();
    return data.reply;
  } catch (error) {
    console.error("Chat API Error:", error);
    return "I'm here to help, but I'm having trouble thinking right now. 🌿";
  }
}
