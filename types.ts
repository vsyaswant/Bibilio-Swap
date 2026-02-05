
export enum ReadingStatus {
  CURRENT = 'Currently Reading',
  PAST = 'Past Read',
  RENTED = 'On Rent',
  OWNED = 'Owned'
}

export enum BookCondition {
  NEW = 'New',
  GOOD = 'Good',
  VINTAGE = 'Vintage',
  WORN = 'Worn'
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
  condition: BookCondition;
  conditionNote?: string;
  addedAt: number;
  language: 'English' | 'Telugu' | 'Hindi' | 'Urdu';
}

export interface TradeRequest {
  id: string;
  bookTitle: string;
  fromUser: string;
  status: 'pending' | 'approved' | 'completed' | 'declined';
  type: 'incoming' | 'outgoing';
  dropOffNote?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  privacy: PrivacyMode;
  friends: string[]; 
  library: Book[];
  location?: string;
  society?: string;
}

export interface Friend {
  id: string;
  name: string;
  avatar: string;
  privacy: PrivacyMode;
}

export type Row = {
  title: string;
  authors: string;
  genre: string;
  thumbnail:string;
};
