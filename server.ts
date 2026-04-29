import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

  const SYSTEM_PROMPTS = {
    'The Organizer': "You are Sage, the Organizer. Your tone is efficient, clear, and highly practical. You focus on logistics, timelines, and making sure nothing is forgotten.",
    'The Decorator': "You are Sage, the Decorator. Your tone is inspiring, aesthetic, and warm. You focus on creating a beautiful atmosphere, matching styles, and sensory details.",
    'The Budget Master': "You are Sage, the Budget Master. Your tone is savvy, resourceful, and encouraging. You focus on ROI, hidden costs, and finding high-value alternatives."
  };

  // API Route for generating essentials
  app.post("/api/generate-essentials", async (req, res) => {
    try {
      const { city, budget, accommodationType, currency, persona } = req.body;
      
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
        model: "gemini-1.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          systemInstruction: SYSTEM_PROMPTS[persona as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS['The Organizer'],
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
      } as any);

      const responseText = result.text;
      res.json(JSON.parse(responseText));
    } catch (error) {
      console.error("API Error (Essentials):", error);
      // Return a robust fallback checklist so the user doesn't see a blank screen
      const fallback = [
        { name: "Water Bottles (Pack)", category: "Essentials", priority: "Critical", urgency: 10, estimatedCost: 200, reasoning: "Hydration is #1 priority on day one." },
        { name: "Basic Bedding Set", category: "Bedroom", priority: "Critical", urgency: 10, estimatedCost: 1500, reasoning: "You need a place to sleep tonight." },
        { name: "First Aid Kit", category: "Essentials", priority: "Must-have", urgency: 8, estimatedCost: 500, reasoning: "Safety basics for any move." },
        { name: "Cleaning Supplies (Basic)", category: "Utility", priority: "Critical", urgency: 9, estimatedCost: 400, reasoning: "Clean the space before unpacking." },
        { name: "Bath Towels", category: "Bathroom", priority: "Must-have", urgency: 8, estimatedCost: 600, reasoning: "Essential for morning routine." },
        { name: "Electric Kettle", category: "Kitchen", priority: "Must-have", urgency: 7, estimatedCost: 1200, reasoning: "Quick tea/coffee and hot water." },
        { name: "Plates & Spoons", category: "Kitchen", priority: "Must-have", urgency: 8, estimatedCost: 800, reasoning: "Basic eating setup." },
        { name: "Curtains / Window Cover", category: "Living Room", priority: "Must-have", urgency: 7, estimatedCost: 1000, reasoning: "Privacy from first day." }
      ];
      res.json(fallback);
    }
  });

  // API Route for chat
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history, persona, context } = req.body;
      
      const systemInstruction = `
        ${SYSTEM_PROMPTS[persona as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS['The Organizer']}
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
        model: "gemini-1.5-flash",
        contents: [
          ...history.map((h: any) => ({
            role: h.role,
            parts: [{ text: h.parts[0].text }]
          })),
          { role: 'user', parts: [{ text: message }] }
        ] as any,
        config: {
          systemInstruction: systemInstruction,
        }
      });

      res.json({ reply: result.text });
    } catch (error) {
      console.error("API Error (Chat):", error);
      res.status(500).json({ error: "Failed to chat" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
