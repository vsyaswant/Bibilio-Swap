
import { GoogleGenAI, Type } from "@google/genai";
import { Book } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Mock CSV Data representing the platform's full catalog
const BOOKS_CATALOG_CSV = `Title,Author,Genre
The Pragmatic Programmer,Andrew Hunt,Tech
Clean Code,Robert C. Martin,Tech
Designing Data-Intensive Applications,Martin Kleppmann,Tech
Kubernetes Up & Running,Brendan Burns,Tech
The Phoenix Project,Gene Kim,Tech
System Design Interview,Alex Xu,Tech
The Great Gatsby,F. Scott Fitzgerald,Classics
To Kill a Mockingbird,Harper Lee,Classics
1984,George Orwell,Classics
Pride and Prejudice,Jane Austen,Classics
The Catcher in the Rye,J.D. Salinger,Classics
Malgudi Days,R. K. Narayan,Regional
Wings of Fire,A. P. J. Abdul Kalam,Biography
Steve Jobs,Walter Isaacson,Biography
The Intelligent Investor,Benjamin Graham,Finance
Rich Dad Poor Dad,Robert Kiyosaki,Finance
Atomic Habits,James Clear,Self-Help
Deep Work,Cal Newport,Self-Help
The Alchemist,Paulo Coelho,Fiction
Tomorrow and Tomorrow and Tomorrow,Gabrielle Zevin,Fiction
Project Hail Mary,Andy Weir,Sci-Fi
Dune,Frank Herbert,Sci-Fi
Foundation,Isaac Asimov,Sci-Fi
The Three-Body Problem,Cixin Liu,Sci-Fi
Olympiad Excellence Guide,MTG,Kids Academic
IB Physics Course Book,Oxford,Kids Academic
ICSE Total English,Morning Star,Kids Academic
Concise Mathematics Class 10,Selina,Kids Academic`;

// Simple parser for the CSV
const parseCSV = (csv: string) => {
  const lines = csv.split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return {
      title: values[0],
      author: values[1],
      genre: values[2]
    };
  });
};

// Chunking mechanism: Group by Genre
const getGenreChunks = () => {
  const books = parseCSV(BOOKS_CATALOG_CSV);
  const chunks: Record<string, string> = {};
  
  books.forEach(book => {
    if (!chunks[book.genre]) {
      chunks[book.genre] = `Genre: ${book.genre}\nBooks:\n`;
    }
    chunks[book.genre] += `- ${book.title} by ${book.author}\n`;
  });
  
  return chunks;
};

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

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Error identifying book:", error);
    throw error;
  }
}

export async function getBookRecommendations(
  userHistory: { current: {title: string, genre: string}[], past: {title: string, genre: string}[] },
  platformBooks: Book[]
) {
  try {
    const genreChunks = getGenreChunks();
    
    // Identify target genres from history (Current + Last 2 Past)
    const historyGenres = new Set([
      ...userHistory.current.map(b => b.genre),
      ...userHistory.past.map(b => b.genre)
    ]);

    // Retrieve relevant chunks (RAG)
    let context = "";
    historyGenres.forEach(genre => {
      if (genreChunks[genre]) {
        context += genreChunks[genre] + "\n";
      }
    });

    // If no specific genre match, provide a general sample
    if (!context) {
      context = Object.values(genreChunks).slice(0, 2).join('\n');
    }

    const availableBooksStr = platformBooks.map(b => `${b.title} by ${b.author} (ID: ${b.id})`).join(', ');

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are the AI Librarian for an exclusive Hyderabad community circle.
      
      CONTEXT (Available Knowledge Base):
      ${context}
      
      USER HISTORY:
      Currently reading: ${userHistory.current.map(b => b.title).join(', ')}
      Past reads: ${userHistory.past.map(b => b.title).join(', ')}
      
      TASK:
      From the following REAL books available in our neighborhood (ID list below), select the top 3 that best match the genres and interests shown in the context and user history.
      
      REAL BOOKS AVAILABLE IN NEIGHBORHOOD:
      [${availableBooksStr}]
      
      Return JSON with the 'bookId' and a 'reason' why it fits their current mood/history.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              bookId: { type: Type.STRING },
              reason: { type: Type.STRING },
              genreMatch: { type: Type.STRING, description: "The specific genre chunk this recommendation was derived from" }
            },
            required: ['bookId', 'reason', 'genreMatch']
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
