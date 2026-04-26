/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;

let genAI: GoogleGenAI | null = null;

export function getGemini() {
  if (!genAI) {
    if (!API_KEY) {
      console.warn("GEMINI_API_KEY is not set.");
      return null;
    }
    genAI = new GoogleGenAI({ apiKey: API_KEY });
  }
  return genAI;
}

export async function askGeographyTutor(query: string, context?: string) {
  const client = getGemini();
  if (!client) return "AI服务暂未配置。";

  try {
    const prompt = context 
      ? `背景信息：${context}\n\n学生问题：${query}`
      : query;

    const result = await client.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: {
          parts: [{
            text: `你是一个专业的地理老师，专门指导高中生进行地理复习。
你需要严格遵循人教版教材内容，并参考湖北省及武汉市的考纲要求。

你的回答应当：
1. 准确、深入浅出。
2. 善于使用地理术语（如：迎风坡、准静止锋、河谷农业等）。
3. 结合“中国地理”背景。
4. 如果可能，提供解析思路。`
          }]
        }
      }
    });

    return result.text || "教师未提供回答。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "抱歉，地理老师暂时走开了，请稍后再试。";
  }
}
