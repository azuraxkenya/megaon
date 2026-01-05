
import { GoogleGenAI, Type } from "@google/genai";
import { EarningsData, User } from "../types";

export const getEarningsInsights = async (user: User, earnings: EarningsData) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    User Profile: ${user.name}
    Current Stats:
    - Total Earned: KES ${earnings.totalEarned}
    - Referral Earnings: KES ${earnings.referralEarnings}
    - Total Withdrawn: KES ${earnings.totalWithdrawn}
    - Account Status: ${user.isActivated ? 'Activated' : 'Pending Activation'}

    Provide 3 actionable tips in JSON format for this user to increase their affiliate earnings in the Kenyan market. 
    Focus on social media sharing (WhatsApp, TikTok, Facebook) and trust-building.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tips: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  icon: { type: Type.STRING, description: "FontAwesome icon class name" }
                },
                required: ["title", "description", "icon"]
              }
            }
          },
          required: ["tips"]
        }
      }
    });

    return JSON.parse(response.text).tips;
  } catch (error) {
    console.error("Error fetching Gemini insights:", error);
    return [
      {
        title: "Share on WhatsApp Status",
        description: "Post your referral link daily with a testimonial to build trust.",
        icon: "fa-brands fa-whatsapp"
      }
    ];
  }
};
