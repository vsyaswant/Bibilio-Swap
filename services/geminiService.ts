
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function identifyBookFromImage(base64Image: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image,
              },
            },
            {
              text: 'Analyze this book cover image. Extract the book title, author, genre, a 2-sentence summary, and the ISBN if visible. Return the details in JSON format.',
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            author: { type: Type.STRING },
            isbn: { type: Type.STRING },
            genre: { type: Type.STRING },
            summary: { type: Type.STRING },
          },
          required: ['title', 'author', 'genre', 'summary'],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    return result;
  } catch (error) {
    console.error("Error identifying book:", error);
    throw error;
  }
}
