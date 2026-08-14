import { Request, Response } from "express";
import Thumbnail from "../models/Thumbnail";
import ai from "../configs/ai";
import { v2 as cloudinary } from "cloudinary";

export const generateThumbnail = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const userId = (req as any).user.id;

    const {
      title,
      style,
      color_scheme,
      aspect_ratio,
      text_overlay,
      additional_details,
    } = req.body;

    if (!title || !style) {
      return res.status(400).json({
        message: "title & style required",
      });
    }

    const prompt = `
Create a professional, highly clickable YouTube thumbnail.

Topic: ${title}
Style: ${style}
Color Scheme: ${color_scheme || "Vibrant"}
Aspect Ratio: ${aspect_ratio || "16:9"}
Text Overlay: ${text_overlay ? "Yes" : "No"}
Additional Details: ${additional_details || "None"}

Requirements:
- Bold and eye-catching
- Strong focal point
- High contrast
- Modern YouTube thumbnail design
- Professional lighting
- Visually engaging background
- Clear composition
- Use the requested color scheme
- Make the topic immediately understandable
- ${
      text_overlay
        ? "Include short, readable text related to the topic"
        : "Do not add unnecessary text"
    }
`;

    // Generate image directly with Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: prompt,
      config: {
        responseModalities: ["TEXT", "IMAGE"],
        imageConfig: {
          aspectRatio: aspect_ratio || "16:9",
        },
      },
    });

    let base64Image: string | null = null;

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.data) {
        base64Image = part.inlineData.data;
        break;
      }
    }

    if (!base64Image) {
      throw new Error("Gemini did not return an image");
    }

    // Upload image to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(
      `data:image/png;base64,${base64Image}`,
      {
        folder: "thumbnails",
        resource_type: "image",
      }
    );

    // Save in MongoDB
    const thumbnail = await Thumbnail.create({
      userId,
      title,
      style,
      color_scheme,
      aspect_ratio,
      text_overlay,
      image_url: uploadResponse.secure_url,
      ai_prompt: prompt,
      isGenerating: false,
    });

    return res.status(200).json({
      message: "Thumbnail generated successfully",
      thumbnail,
    });
  } catch (err: any) {
    console.error("Generation Error:", err);

    return res.status(500).json({
      message: err?.message || "Something went wrong",
    });
  }
};

export const getMyGenerations = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const userId = (req as any).user.id;

    const thumbnails = await Thumbnail.find({ userId }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      thumbnails,
    });
  } catch (err: any) {
    console.error("Get generations error:", err);

    return res.status(500).json({
      message: err?.message || "Failed to fetch generations",
    });
  }
};

export const deleteThumbnail = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;

    await Thumbnail.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Thumbnail deleted",
    });
  } catch (err: any) {
    console.error("Delete thumbnail error:", err);

    return res.status(500).json({
      message: err?.message || "Delete failed",
    });
  }
};