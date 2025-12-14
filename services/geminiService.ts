import { GoogleGenAI } from "@google/genai";

// Initialize the client. 
// Note: In a real production app, the key might come from the user settings if not in env.
// For this request, we assume it's available or we might prompt the user if missing (though user asked for API KEY system).
// Since the prompt asks for an Admin managed system, we assume the Admin configured key is injected or we use a demo key.
// Here we use process.env.API_KEY as per instructions.

const getAIClient = () => {
  const apiKey = process.env.API_KEY; 
  if (!apiKey) {
    console.warn("No API KEY found in environment. Please ensure process.env.API_KEY is set.");
    // Fallback or error handling would go here.
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

export const geminiService = {
  /**
   * Generates an image or edits an image using Gemini.
   */
  generateImage: async (
    prompt: string,
    referenceImageBase64?: string,
    refMimeType?: string
  ): Promise<string> => {
    const ai = getAIClient();
    
    // Use 'gemini-2.5-flash-image' for general purpose image tasks (fast, efficient)
    // or 'gemini-3-pro-image-preview' for higher quality logic if needed.
    // Based on guidelines: General Image Generation/Editing -> 'gemini-2.5-flash-image'
    const model = 'gemini-2.5-flash-image';

    const parts: any[] = [];
    
    if (referenceImageBase64 && refMimeType) {
      parts.push({
        inlineData: {
          data: referenceImageBase64,
          mimeType: refMimeType
        }
      });
    }

    parts.push({ text: prompt });

    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: { parts },
        config: {
          // No responseMimeType for image models usually unless specific output JSON
        }
      });

      // Extract image from response
      // Based on guidelines, iterate parts
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            return part.inlineData.data;
          }
        }
      }
      
      throw new Error("No image generated.");
    } catch (error) {
      console.error("Gemini Image Gen Error:", error);
      throw error;
    }
  },

  /**
   * Upscales an image to 4K using the Pro model.
   */
  upscaleImage4K: async (imageBase64: string, mimeType: string): Promise<string> => {
    const ai = getAIClient();
    // High-Quality Image Generation/Editing Tasks -> 'gemini-3-pro-image-preview'
    const model = 'gemini-3-pro-image-preview';

    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: {
          parts: [
            {
              inlineData: {
                data: imageBase64,
                mimeType: mimeType
              }
            },
            {
              text: "Upscale this image to 4K resolution, enhancing details while preserving the original composition and style."
            }
          ]
        },
        config: {
            imageConfig: {
                imageSize: "4K" // Explicitly requesting 4K
            }
        }
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            return part.inlineData.data;
          }
        }
      }
      
      throw new Error("Failed to upscale image.");
    } catch (error) {
      console.error("Upscale Error:", error);
      throw error;
    }
  }
};