import mongoose, { Document, Model } from "mongoose";

export interface IThumbnail extends Document {
  userId: string;
  title: string;
  style: string;
  aspect_ratio?: string;
  color_scheme?: string;
  text_overlay?: boolean;
  image_url?: string;
  ai_prompt?: string;
  isGenerating?: boolean;
}

const ThumbnailSchema = new mongoose.Schema<IThumbnail>(
  {
    userId: {
      type: String,
      required: true,
      index: true, // ❌ NOT unique (history allowed)
    },
    title: { type: String, required: true },
    style: { type: String, required: true },
    aspect_ratio: { type: String, default: "16:9" },
    color_scheme: String,
    text_overlay: Boolean,
    image_url: { type: String, default: "" },
    ai_prompt: String,
    isGenerating: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ThumbnailModel: Model<IThumbnail> =
  mongoose.models.Thumbnail ??
  mongoose.model<IThumbnail>("Thumbnail", ThumbnailSchema);

export default ThumbnailModel;
