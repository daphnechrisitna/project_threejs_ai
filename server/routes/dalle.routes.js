import express from "express";
import * as dotenv from "dotenv";
import { GoogleGenAI, Modality } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const router = express.Router();

router.post("/", async (req, res) => {
  console.log("Received request body:", req.body);
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }
  console.log("Calling Gemini Flash with prompt:", prompt);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: prompt,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    const parts = response.candidates[0].content.parts;
    const imagePart = parts.find(p => p.inlineData || p.inline_data);
    if (!imagePart) {
      throw new Error("No image returned from Gemini");
    }

    const base64 = (imagePart.inlineData ?? imagePart.inline_data).data;
    const buffer = Buffer.from(base64, "base64");

    res.set("Content-Type", "image/png");
    return res.send(buffer);
  } catch (error) {
    console.error("Gemini Error:", error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
