
import { GoogleGenAI, Type } from "@google/genai";
import { Book, ReadingStatus } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// The content of reco.csv as requested.
export const RECO_CSV_CONTENT = `title,author,genere,url
The God and the Gwisin,Kim Young-ha,Fantasy,https://www.goodreads.com/book/show/218662681-the-god-and-the-gwisin
House of Idyl,Lucy Gray,Romance,https://www.goodreads.com/book/show/223407042-house-of-idyll
Project Hail Mary,Andy Weir,Sci-Fi,https://www.goodreads.com/book/show/54493401-project-hail-mary
Dune,Frank Herbert,Sci-Fi,https://www.goodreads.com/book/show/44767458-dune
Atomic Habits,James Clear,Self-Help,https://www.goodreads.com/book/show/40121378-atomic-habits
The Alchemist,Paulo Coelho,Fantasy,https://www.goodreads.com/book/show/112503.The_Alchemist
Circe,Madeline Miller,Fantasy,https://www.goodreads.com/book/show/35959740-circe
People We Meet on Vacation,Emily Henry,Romance,https://www.goodreads.com/book/show/54985743-people- we-meet-on-vacation
Normal People,Sally Rooney,Romance,https://www.goodreads.com/book/show/41057294-normal-people
The Midnight Library,Matt Haig,Fantasy,https://www.goodreads.com/book/show/52578297-the-midnight-library
Clean Code,Robert C. Martin,Tech,https://www.goodreads.com/book/show/3735293-clean-code
System Design Interview,Alex Xu,Tech,https://www.goodreads.com/book/show/54134074-system-design-interview`;

/**
 * Fetches the official cover image from Google Books API.
 */
async function getGoogleBooksMetadata(title: string, author?: string, isbn?: string) {
  try {
    let query = '';
    if (isbn) query = `isbn:${isbn.replace(/[^0-9X]/gi, '')}`;
    else query = `intitle:${encodeURIComponent(title)}${author ? `+inauthor:${encodeURIComponent(author)}` : ''}`;

    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`);
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const info = data.items[0].volumeInfo;
      // Get the highest resolution image available
      const cover = info.imageLinks?.extraLarge || 
                    info.imageLinks?.large || 
                    info.imageLinks?.medium || 
                    info.imageLinks?.thumbnail || 
                    info.imageLinks?.smallThumbnail;
      
      return {
        coverUrl: cover?.replace('http:', 'https:'),
        officialTitle: info.title,
        officialAuthor: info.authors?.join(', '),
        description: info.description,
        isbn: info.industryIdentifiers?.[0]?.identifier
      };
    }
  } catch (err) {
    console.error("Google Books Fetch Error:", err);
  }
  return null;
}

/**
 * Parses the reco.csv content into Book objects.
 */
export const parseRecoCSV = (csv: string): Book[] => {
  const lines = csv.trim().split('\n');
  return lines.slice(1).map((line, index) => {
    const values = line.split(',');
    const title = values[0] || 'Unknown Title';
    const author = values[1] || 'Unknown Author';
    const genere = values[2] || 'General';
    const url = values[3] || '';
    
    return {
      id: `csv-${index}`,
      title,
      author,
      genre: genere,
      summary: `A highly recommended ${genere} title from the community catalog.`,
      coverUrl: `https://picsum.photos/seed/${title.replace(/\s/g, '')}/400/600`,
      status: ReadingStatus.OWNED,
      addedAt: Date.now(),
      language: 'English',
      isbn: url
    };
  });
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
              text: 'Analyze this book cover image. Extract title, author, genre, summary, and ISBN. Return JSON.',
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
    
    const detected = JSON.parse(response.text || '{}');
    
    // Attempt to enrich with Google Books for high quality image
    const official = await getGoogleBooksMetadata(detected.title, detected.author, detected.isbn);
    if (official && official.coverUrl) {
      return { ...detected, coverUrl: official.coverUrl };
    }
    
    return detected;
  } catch (error) {
    console.error("Error identifying book:", error);
    throw error;
  }
}

/**
 * Search for book details by text query using Google Books data.
 */
export async function searchBookByTitle(query: string) {
  try {
    // 1. Use Gemini to refine the query and understand the book context
    const refineResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `User wants to find a book with this query: "${query}". Identify the likely Title and Author. Output JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            author: { type: Type.STRING }
          }
        },
      }
    });
    
    const refined = JSON.parse(refineResponse.text || '{}');
    const title = refined.title || query;
    const author = refined.author || '';

    // 2. Query Google Books for the real data and high-res cover
    const official = await getGoogleBooksMetadata(title, author);

    if (official) {
      return {
        title: official.officialTitle || title,
        author: official.officialAuthor || author,
        genre: 'Literary', // Fallback or could be parsed from categories
        summary: official.description?.substring(0, 300) + '...' || 'No summary available.',
        coverUrl: official.coverUrl || `https://picsum.photos/seed/${title.replace(/\s/g, '')}/400/600`,
        isbn: official.isbn
      };
    }

    // 3. Last fallback: Pure Gemini generation if API fails or find nothing
    const fallbackResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide details for the book: "${query}". Return JSON with title, author, genre, summary.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            author: { type: Type.STRING },
            genre: { type: Type.STRING },
            summary: { type: Type.STRING },
          },
          required: ['title', 'author', 'genre', 'summary'],
        },
      },
    });

    const fallbackData = JSON.parse(fallbackResponse.text || '{}');
    return {
      ...fallbackData,
      coverUrl: `https://picsum.photos/seed/${fallbackData.title.replace(/\s/g, '')}/400/600`
    };
  } catch (error) {
    console.error("Error searching book:", error);
    throw error;
  }
}

// Added helper to group books by genre and return string chunks for RAG context.
function getGenreChunks(books: Book[]): Record<string, string> {
  const chunks: Record<string, string> = {};
  books.forEach(book => {
    if (!chunks[book.genre]) {
      chunks[book.genre] = "";
    }
    chunks[book.genre] += `- ${book.title} by ${book.author}\n`;
  });
  return chunks;
}

/**
 * Hierarchical RAG Recommendation logic stays the same but filters pool.
 */
export async function getBookRecommendations(
  userHistory: { current: {title: string, genre: string}[], past: {title: string, genre: string}[] },
  csvBooks: Book[],
  friendsBooks: Book[],
  userOwnedTitles: string[]
) {
  try {
    const ownedSet = new Set(userOwnedTitles.map(t => t.toLowerCase().trim()));
    const availableFriendsBooks = friendsBooks.filter(b => !ownedSet.has(b.title.toLowerCase().trim()));
    const availableCsvBooks = csvBooks.filter(b => !ownedSet.has(b.title.toLowerCase().trim()));

    const neighborChunks = getGenreChunks(availableFriendsBooks);
    const csvChunks = getGenreChunks(availableCsvBooks);
    
    const historyGenres = new Set([
      ...userHistory.current.map(b => b.genre),
      ...userHistory.past.map(b => b.genre)
    ]);

    let extendedContext = "AVAILABLE BOOK POOL CONTEXT:\n";
    historyGenres.forEach(genre => {
      extendedContext += `Genre: ${genre}\n`;
      if (neighborChunks[genre]) extendedContext += `[From Neighbors]:\n${neighborChunks[genre]}`;
      else if (csvChunks[genre]) extendedContext += `[From Community Catalog]:\n${csvChunks[genre]}`;
      extendedContext += "---\n";
    });

    const allAvailableBooks = [...availableFriendsBooks, ...availableCsvBooks];
    const availablePoolStr = allAvailableBooks
      .map(b => `${b.title} by ${b.author} (ID: ${b.id})`)
      .join(', ');

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a sophisticated AI Librarian. 
      Recommend exactly 3 books from the AVAILABLE POOL. 
      NEVER recommend books the user already owns: [${userOwnedTitles.join(', ')}].
      Prioritize Neighbors.
      
      CONTEXT:
      ${extendedContext}
      
      POOL:
      [${availablePoolStr}]
      
      Output JSON: [{ "bookId": string, "reason": string, "sourceType": "neighbor" | "catalog" }]`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              bookId: { type: Type.STRING },
              reason: { type: Type.STRING },
              sourceType: { type: Type.STRING }
            },
            required: ['bookId', 'reason', 'sourceType']
          }
        },
      },
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("RAG Error:", error);
    return [];
  }
}
