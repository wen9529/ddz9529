export enum Suit {
  Spades = '♠',
  Hearts = '♥',
  Clubs = '♣',
  Diamonds = '♦',
  None = '' // For Jokers
}

export interface Card {
  id: string; // Unique ID for React keys
  rank: string; // Display rank: '3', '4', ... 'K', 'A', '2', 'SJ' (Small Joker), 'BJ' (Big Joker)
  value: number; // Logic value: 3=3 ... K=13, A=14, 2=15, SJ=16, BJ=17
  suit: Suit;
  color: 'red' | 'black';
}

export enum PlayerRole {
  Landlord = 'Landlord',
  Peasant = 'Peasant'
}

export enum GamePhase {
  Lobby = 'LOBBY',
  Dealing = 'DEALING',
  Bidding = 'BIDDING',
  Playing = 'PLAYING',
  GameOver = 'GAME_OVER'
}

export interface Player {
  id: number;
  name: string;
  isHuman: boolean;
  hand: Card[];
  role: PlayerRole | null;
  lastAction: 'play' | 'pass' | null;
}

export interface PlayedHand {
  playerId: number;
  cards: Card[];
}

// Minimal Telegram WebApp Types
export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: any;
  colorScheme: 'light' | 'dark';
  themeParams: any;
  isExpanded: boolean;
  viewportHeight: number;
  ready: () => void;
  expand: () => void;
  close: () => void;
  showPopup: (params: { title?: string; message: string; buttons?: any[] }, callback?: (buttonId: string) => void) => void;
  openInvoice: (url: string, callback?: (status: 'paid' | 'cancelled' | 'failed' | 'pending') => void) => void;
  openTelegramLink: (url: string) => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}