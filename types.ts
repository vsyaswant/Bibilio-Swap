
export enum ReadingStatus {
  CURRENT = 'Currently Reading',
  PAST = 'Past Read',
  RENTED = 'On Rent',
  OWNED = 'Owned'
}

export enum PrivacyMode {
  PUBLIC = 'Public',
  PRIVATE = 'Private'
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  genre: string;
  summary: string;
  coverUrl: string;
  status: ReadingStatus;
  addedAt: number;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  privacy: PrivacyMode;
  friends: string[]; // List of user IDs
  library: Book[];
}

export interface Friend {
  id: string;
  name: string;
  avatar: string;
  privacy: PrivacyMode;
}
