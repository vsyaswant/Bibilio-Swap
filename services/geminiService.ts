
import { GoogleGenAI, Type } from "@google/genai";
import { Book } from "../types";

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

export async function getBookRecommendations(
  userBooks: { current: string[], past: string[] },
  availableBooks: Book[]
) {
  try {
    const availableBooksList = availableBooks.map(b => `${b.title} by ${b.author} (ID: ${b.id})`).join(', ');
    const history = `Currently reading: ${userBooks.current.join(', ')}. Past reads: ${userBooks.past.join(', ')}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a sophisticated librarian at an elite community clubhouse. 
      Based on the user's reading history: "${history}", recommend up to 3 books from this specific available list: [${availableBooksList}].
      Provide a personalized reason for each recommendation. Return the result in JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              bookId: { type: Type.STRING, description: "The ID of the recommended book from the provided list" },
              reason: { type: Type.STRING, description: "A 1-sentence personalized reason why this fits the user's taste" }
            },
            required: ['bookId', 'reason']
          }
        },
      },
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Error getting recommendations:", error);
    return [];
  }
}
