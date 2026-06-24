import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "50mb" }));

  // Debug middleware
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  // Food Analysis API (Server-Side to protect keys and keep it standardized)
  app.post("/api/analyze-food", async (req, res) => {
    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ error: "Image data is required" });
      }

      console.log("Raw process.env keys present on server:", {
        GEMINI_API_KEY: process.env.GEMINI_API_KEY ? `${process.env.GEMINI_API_KEY.substring(0, 4)}...${process.env.GEMINI_API_KEY.slice(-4)} (length: ${process.env.GEMINI_API_KEY.length})` : "undefined",
        GEMINI_API_KEY_2: process.env.GEMINI_API_KEY_2 ? `${process.env.GEMINI_API_KEY_2.substring(0, 4)}...${process.env.GEMINI_API_KEY_2.slice(-4)} (length: ${process.env.GEMINI_API_KEY_2.length})` : "undefined",
        GEMINI_API_KEY_3: process.env.GEMINI_API_KEY_3 ? `${process.env.GEMINI_API_KEY_3.substring(0, 4)}...${process.env.GEMINI_API_KEY_3.slice(-4)} (length: ${process.env.GEMINI_API_KEY_3.length})` : "undefined",
      });

      // Collect and cleanse all keys
      const apiKeys = [
        process.env.GEMINI_API_KEY,
        process.env.GEMINI_API_KEY_2,
        process.env.GEMINI_API_KEY_3
      ]
        .map(k => k?.trim()?.replace(/^["']|["']$/g, ''))
        .filter(k => k && k.startsWith("AIzaSy")) as string[];

      console.log("Cleansed apiKeys array length:", apiKeys.length);

      if (apiKeys.length === 0) {
        console.error("No valid GEMINI_API_KEY is found in the environment.");
        return res.status(500).json({ error: "Vedic Portal currently closed (API key missing)" });
      }

      const prompt = `
        Analyze this food image. Use a humble, wise Ayurvedic tone.
        
        Provide the following details:
        - food name
        - estimated calories
        - protein (g)
        - carbs (g)
        - fat (g)
        - health score out of 100
        - Ayurvedic diet advice (mention Agni, Doshas)
        - a concluding path (Safe/Caution)
        
        Return ONLY a JSON object with these keys: 
        name, calories, protein, carbs, fat, healthScore, aiSummary, status
      `;

      // Extract base64 and mime type robustly
      let base64Data = "";
      let mimeType = "image/jpeg";

      if (image.includes(",")) {
        base64Data = image.split(",")[1];
        const header = image.split(",")[0];
        if (header.includes(":") && header.includes(";")) {
          mimeType = header.split(":")[1].split(";")[0];
        }
      } else {
        base64Data = image;
      }

      const modelsToTry = ["gemini-3-flash-preview", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
      let lastError: any = null;
      let successResponse: any = null;

      // Iterate through keys, then try the fallback models for each key
      for (let i = 0; i < apiKeys.length; i++) {
        const key = apiKeys[i];
        const ai = new GoogleGenAI({
          apiKey: key,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            },
          },
        });

        for (const model of modelsToTry) {
          try {
            console.log(`Attempting food analysis with Key Index ${i} and model: ${model}`);
            const response = await ai.models.generateContent({
              model: model,
              contents: {
                parts: [
                  { text: prompt },
                  {
                    inlineData: {
                      data: base64Data,
                      mimeType: mimeType,
                    },
                  },
                ],
              },
              config: {
                responseMimeType: "application/json",
              },
            });
            
            if (response && response.text) {
              successResponse = response;
              break; // Found working combination, break inner loop
            }
          } catch (modelErr: any) {
            console.warn(`Key Index ${i} failed with model ${model}:`, modelErr?.message || modelErr);
            lastError = modelErr;
            // Check if key is invalid, if so don't bother trying other models on this key
            const errStr = (modelErr?.message || "").toLowerCase() + " " + JSON.stringify(modelErr).toLowerCase();
            if (errStr.includes("key not valid") || errStr.includes("invalid") || errStr.includes("400") || errStr.includes("403") || errStr.includes("permission_denied") || errStr.includes("unauthorized")) {
              break; 
            }
          }
        }
        if (successResponse) {
          break; // Found working combination, break outer loop
        }
      }

      if (!successResponse) {
        throw lastError || new Error("All API keys and fallback models failed to analyze image.");
      }

      const resultText = successResponse.text;
      if (!resultText) {
        throw new Error("The Vedic Lens returned no clear vision. Please try again.");
      }

      const parsedResult = JSON.parse(resultText);

      res.json({
        name: parsedResult.name || "Detected Food",
        calories: parsedResult.calories || 0,
        protein: parsedResult.protein || 0,
        carbs: parsedResult.carbs || 0,
        fat: parsedResult.fat || 0,
        healthScore: parsedResult.healthScore || 50,
        aiSummary: parsedResult.aiSummary || "Analysis complete.",
        status: parsedResult.status || "Caution",
      });
    } catch (err: any) {
      console.error("Food analysis failure:", err);
      res.status(500).json({
        error: "Vedic Consultation Failed",
        details: err?.message || "The spirits are silent. Please try again.",
      });
    }
  });

  // Barcode Lookup API
  app.get("/api/barcode/:barcode?", async (req, res) => {
    try {
      const barcode = req.params.barcode;
      if (!barcode) {
        return res.status(400).json({ error: "Barcode is required" });
      }
      const response = await axios.get(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
      );

      if (!response.data || response.data.status === 0) {
        return res.status(404).json({ error: "Product not found" });
      }

      const product = response.data.product;

      res.json({
        name: product.product_name || "Unknown Product",
        calories: product.nutriments?.energy_kcal || 0,
        protein: product.nutriments?.proteins || 0,
        carbs: product.nutriments?.carbohydrates || 0,
        fat: product.nutriments?.fat || 0,
        healthScore: 70, // Default for now
        aiSummary: `Ingredients: ${product.ingredients_text || "Not listed"}\n\nNutri-Score: ${product.nutriscore_grade?.toUpperCase() || "N/A"}`,
      });
    } catch (err: any) {
      console.error("Barcode lookup failed:", err);
      if (err?.response?.status === 404) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.status(500).json({ error: "Barcode lookup failed" });
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
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
