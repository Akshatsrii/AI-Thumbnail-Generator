import { Request, Response } from "express";
import Thumbnail from "../models/Thumbnail";
import ai from "../configs/ai";
import { v2 as cloudinary } from "cloudinary";

/* ============================
   🎯 GENERATE THUMBNAIL (GEMINI + IMAGEN)
   ============================ */
export const generateThumbnail = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user.id;

    const {
      title,
      style,
      color_scheme,
      aspect_ratio,
      text_overlay,
    } = req.body;

    if (!title || !style) {
      return res
        .status(400)
        .json({ message: "title & style required" });
    }

    /* ---------- 1️⃣ GEMINI PROMPT (TEXT) ---------- */
    // Using gemini-2.5-flash for better prompt reasoning
    const prompt = `
      You are an expert prompt engineer for AI image generators (like Imagen 3).
      Create a highly detailed, descriptive image prompt for a YouTube thumbnail.
      
      User Inputs:
      - Title: "${title}"
      - Style: "${style}"
      - Color scheme: "${color_scheme}"
      - Aspect Ratio: "${aspect_ratio}"
      - Text overlay: ${text_overlay ? "Yes" : "No"}

      Strict Output Rules:
      - Provide ONLY the raw English prompt string.
      - Do NOT include words like "Prompt:", "Here is the prompt", or markdown.
      - Describe the lighting, composition, subject, and mood in detail.
    `;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    const aiPrompt = result.text ? result.text.trim() : "";

    /* ---------- 2️⃣ IMAGE GENERATION (REAL IMAGEN 3) ---------- */
    // Using the official @google/genai SDK for image generation
    const imageResponse = await ai.models.generateImages({
      model: "imagen-3.0-generate-001",
      prompt: aiPrompt,
      config: {
        numberOfImages: 1,
        aspectRatio: aspect_ratio || "16:9",
        personGeneration: "ALLOW_ADULT", // Enum is usually uppercase in SDK
      },
    });

    // Extract Base64 image
    const base64Image = imageResponse.generatedImages?.[0]?.image?.imageBytes;
    
    if (!base64Image) {
        throw new Error("Failed to generate image (No data returned)");
    }

    /* ---------- 3️⃣ UPLOAD TO CLOUDINARY ---------- */
    // Upload the base64 string directly
    const uploadResponse = await cloudinary.uploader.upload(
      `data:image/png;base64,${base64Image}`, 
      {
        folder: "thumbnails",
        resource_type: "image",
      }
    );

    /* ---------- 4️⃣ SAVE IN DB ---------- */
    const thumbnail = await Thumbnail.create({
      userId,
      title,
      style,
      color_scheme,
      aspect_ratio,
      text_overlay,
      image_url: uploadResponse.secure_url,
      ai_prompt: aiPrompt,
      isGenerating: false,
    });

    res.json({
      message: "Thumbnail generated successfully",
      thumbnail,
    });
  } catch (err: any) {
    console.error("Generation Error:", err);
    res.status(500).json({ message: err.message || "Something went wrong" });
  }
};

/* ============================
   📚 MY GENERATIONS
   ============================ */
export const getMyGenerations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const thumbnails = await Thumbnail.find({ userId })
      .sort({ createdAt: -1 });

    res.json({ thumbnails });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/* ============================
   🗑 DELETE
   ============================ */
export const deleteThumbnail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Thumbnail.findByIdAndDelete(id);
    res.json({ message: "Thumbnail deleted" });
  } catch {
    res.status(500).json({ message: "Delete failed" });
  }
};