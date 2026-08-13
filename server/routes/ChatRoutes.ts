import { Router, Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";

const router = Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
    });

    return res.status(200).json({
      reply: response.text || "No response generated",
    });
  } catch (error: any) {
    console.error("Gemini Error:", error);

    return res.status(500).json({
      error: error?.message || "Internal Server Error",
    });
  }
});

export default router;