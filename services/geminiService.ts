import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { ExpertType, TradeSignal, ScreenerTicker } from '../types';
import { EXPERT_PROMPTS } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to convert file to Base64
export const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeChart = async (
  imageFile: File | null,
  textPrompt: string,
  expert: ExpertType
): Promise<string> => {
  try {
    const model = "gemini-2.5-flash";
    const parts: any[] = [];
    
    if (imageFile) {
      const imagePart = await fileToGenerativePart(imageFile);
      parts.push(imagePart);
    }

    const finalPrompt = textPrompt.trim() || "Analyze the provided chart image.";
    parts.push({ text: finalPrompt });

    const systemInstruction = EXPERT_PROMPTS[expert] + 
      "\n\nPlease format the response using Markdown. Use bolding for key terms. Keep it concise and actionable.";

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: { parts },
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.4,
        maxOutputTokens: 1000,
      }
    });

    if (response.text) return response.text;

    const candidate = response.candidates?.[0];
    if (candidate && candidate.finishReason !== 'STOP') {
        return `Analysis stopped: ${candidate.finishReason}`;
    }

    return "No analysis generated.";
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    return `Analysis failed: ${error.message}`;
  }
};

export const generateTradeSignal = async (
    imageFile: File | null,
    pair: string = "EUR/USD"
): Promise<TradeSignal | null> => {
    try {
        const model = "gemini-2.5-flash";
        const parts: any[] = [];

        if (imageFile) {
            const imagePart = await fileToGenerativePart(imageFile);
            parts.push(imagePart);
        }

        parts.push({ 
            text: `Analyze this ${pair} chart. act as a Signal Generator. Identify a potential trade setup. If no clear setup exists, suggest WAIT.` 
        });

        const response: GenerateContentResponse = await ai.models.generateContent({
            model,
            contents: { parts },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        pair: { type: Type.STRING },
                        action: { type: Type.STRING, enum: ["BUY", "SELL", "WAIT"] },
                        entry: { type: Type.NUMBER },
                        stopLoss: { type: Type.NUMBER },
                        takeProfit: { type: Type.NUMBER },
                        confidence: { type: Type.NUMBER, description: "Confidence score 0-100" },
                        reasoning: { type: Type.STRING },
                        timeframe: { type: Type.STRING }
                    },
                    required: ["pair", "action", "entry", "stopLoss", "takeProfit", "confidence", "reasoning"]
                }
            }
        });

        if (response.text) {
            const data = JSON.parse(response.text);
            return {
                ...data,
                timestamp: Date.now()
            } as TradeSignal;
        }
        return null;

    } catch (error) {
        console.error("Signal Generation Error:", error);
        return null;
    }
};

export const generateMarketReport = async (ticker: ScreenerTicker): Promise<string> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `
    Act as a Senior Forex Analyst. Generate a brief but comprehensive technical market report for ${ticker.symbol} based on the following real-time screening data:
    
    - Price: ${ticker.price}
    - 24h Change: ${ticker.changePercent}%
    - Trend: ${ticker.trend}
    - RSI (14): ${ticker.rsi}
    - Volatility: ${ticker.volatility}
    - Automated Signal: ${ticker.signal}

    Your report should include:
    1. **Market Context**: Interpret the trend and volatility.
    2. **Key Levels**: Estimate potential support/resistance based on psychological levels near the current price.
    3. **RSI Analysis**: Is it overbought/oversold?
    4. **Execution Strategy**: Suggest a trading approach (e.g., Breakout, Retest, Scalp).

    Format the response in clean Markdown with headers and bullet points. Keep it under 300 words.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: { parts: [{ text: prompt }] },
      config: {
        temperature: 0.7,
      }
    });

    if (response.text) return response.text;
    return "Unable to generate report at this time.";

  } catch (error: any) {
    console.error("Report Generation Error:", error);
    return `Error generating report: ${error.message}`;
  }
};
