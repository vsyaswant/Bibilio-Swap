
import { GoogleGenAI, Type } from "@google/genai";
import { Book, ReadingStatus } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// The content of reco.csv as requested.
export const RECO_CSV_CONTENT = `title,authors,genre,thumbnail
Gilead,Marilynne Robinson,Fiction,http://books.google.com/books/content?id=KQZCPgAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
Spider's Web,Charles Osborne;Agatha Christie,Detective and mystery stories,http://books.google.com/books/content?id=gA5GPgAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
The One Tree,Stephen R. Donaldson,American fiction,http://books.google.com/books/content?id=OmQawwEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
Rage of angels,Sidney Sheldon,Fiction,http://books.google.com/books/content?id=FKo2TgANz74C&printsec=frontcover&img=1&zoom=1&source=gbs_api
The Four Loves,Clive Staples Lewis,Christian life,http://books.google.com/books/content?id=XhQ5XsFcpGIC&printsec=frontcover&img=1&zoom=1&source=gbs_api
The Problem of Pain,Clive Staples Lewis,Christian life,http://books.google.com/books/content?id=Kk-uVe5QK-gC&printsec=frontcover&img=1&zoom=1&source=gbs_api
An Autobiography,Agatha Christie,"Authors, English",http://books.google.com/books/content?id=c49GQwAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
Empires of the Monsoon,Richard Hall,"Africa, East",http://books.google.com/books/content?id=MuPEQgAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
The Gap Into Madness,Stephen R. Donaldson,"Hyland, Morn (Fictitious character)",http://books.google.com/books/content?id=4oXavLNDWocC&printsec=frontcover&img=1&zoom=1&source=gbs_api
Master of the Game,Sidney Sheldon,Adventure stories,http://books.google.com/books/content?id=TkTYp-Tp6_IC&printsec=frontcover&img=1&zoom=1&source=gbs_api
If Tomorrow Comes,Sidney Sheldon,Adventure stories,http://books.google.com/books/content?id=l2tBi_jLuk8C&printsec=frontcover&img=1&zoom=1&source=gbs_api
Assassin's Apprentice,Robin Hobb,American fiction,http://books.google.com/books/content?id=qTaGQgAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
Warhost of Vastmark,Janny Wurts,Fiction,http://books.google.com/books/content?id=uOL0fpS9WZkC&printsec=frontcover&img=1&zoom=1&source=gbs_api
The Once and Future King,Terence Hanbury White,Arthurian romances,http://books.google.com/books/content?id=Jx6BvgEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
Murder in LaMut,Raymond E. Feist;Joel Rosenberg,Adventure stories,http://books.google.com/books/content?id=I2jbBlMHlAMC&printsec=frontcover&img=1&zoom=1&source=gbs_api
Jimmy the Hand,Raymond E. Feist;S. M. Stirling,Fantasy fiction,http://books.google.com/books/content?id=hV4-oITYFN8C&printsec=frontcover&img=1&zoom=1&source=gbs_api
Well of Darkness,Margaret Weis;Tracy Hickman,,http://books.google.com/books/content?id=XrwaAAAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
Witness for the Prosecution & Selected Plays,Agatha Christie,English drama,http://books.google.com/books/content?id=_9u7AAAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api
The Little House,Philippa Gregory,Country life,http://books.google.com/books/content?id=rbvUPps9vKsC&printsec=frontcover&img=1&zoom=1&source=gbs_api`;

/**
 * Fetches the official cover image and metadata from Google Books API.
 */
export async function getGoogleBooksMetadata(title: string, author?: string, isbn?: string) {
  try {
    let query = '';
    if (isbn && isbn.length > 5) {
      query = `isbn:${isbn.replace(/[^0-9X]/gi, '')}`;
    } else {
      // Clean query for better matching
      const cleanTitle = title.replace(/[^\w\s]/gi, '');
      const cleanAuthor = author ? author.replace(/[^\w\s]/gi, '') : '';
      query = `intitle:${encodeURIComponent(cleanTitle)}${cleanAuthor ? `+inauthor:${encodeURIComponent(cleanAuthor)}` : ''}`;
    }

    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=3`);
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      // Find the best match (sometimes first isn't best if query was broad)
      const info = data.items[0].volumeInfo;
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
        genre: info.categories?.[0] || 'General',
        isbn: info.industryIdentifiers?.find((id: any) => id.type.includes('ISBN'))?.identifier
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
      coverUrl: url,
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
      return { 
        ...detected, 
        coverUrl: official.coverUrl,
        title: official.officialTitle || detected.title,
        author: official.officialAuthor || detected.author
      };
    }
    
    return detected;
  } catch (error) {
    console.error("Error identifying book:", error);
    throw error;
  }
}

export async function searchBookByTitle(query: string) {
  try {
    const refineResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `User query: "${query}". Identify Title and Author. Output JSON.`,
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
    const official = await getGoogleBooksMetadata(refined.title || query, refined.author);

    if (official) {
      return {
        title: official.officialTitle || refined.title || query,
        author: official.officialAuthor || refined.author || 'Unknown Author',
        genre: official.genre || 'Literary',
        summary: official.description?.substring(0, 300) + '...' || 'No summary available.',
        coverUrl: official.coverUrl || `https://picsum.photos/seed/${query.replace(/\s/g, '')}/400/600`,
        isbn: official.isbn
      };
    }

    const fallbackResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide details for: "${query}". Return JSON.`,
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

function getGenreChunks(books: Book[]): Record<string, string> {
  const chunks: Record<string, string> = {};
  books.forEach(book => {
    if (!chunks[book.genre]) chunks[book.genre] = "";
    chunks[book.genre] += `- ${book.title} by ${book.author}\n`;
  });
  return chunks;
}

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
      contents: `Recommend 3 books from the pool. Exclude: [${userOwnedTitles.join(', ')}]. JSON Output.`,
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
