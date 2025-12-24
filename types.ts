
export interface Question {
  id: number | string;
  text: string;
  options: string[];
  seriesId: number | 'ai';
  correctIndex?: number; // مؤشر الإجابة الصحيحة (0-5)
  isAI?: boolean;
}

export enum MainMode {
  SELECTION = 'SELECTION',
  ONE_DEVICE = 'ONE_DEVICE',
  ONLINE = 'ONLINE',
  SOLO = 'SOLO'
}

export enum GameView {
  SERIES_SELECTION = 'SERIES_SELECTION',
  RULES = 'RULES',
  MENU = 'MENU',
  QUESTION = 'QUESTION',
  FAVORITES = 'FAVORITES',
  AI_GENERATING = 'AI_GENERATING',
  SERIES_COMPLETED = 'SERIES_COMPLETED'
}

export enum OnlineView {
  ENTRY = 'ENTRY',
  JOIN = 'JOIN',
  LOBBY = 'LOBBY',
  SELECT_SERIES = 'SELECT_SERIES',
  WAITING_FOR_HOST = 'WAITING_FOR_HOST',
  ROOM = 'ROOM',
  RESULTS = 'RESULTS'
}

export enum SoloView {
  ENTRY = 'ENTRY',
  SELECT_SERIES = 'SELECT_SERIES',
  ROOM = 'ROOM'
}

export enum Orientation {
  PORTRAIT = 'PORTRAIT',
  LANDSCAPE = 'LANDSCAPE'
}

export interface Series {
  id: number | 'ai';
  name: string;
  description: string;
  isSpecial?: boolean;
  color?: string;
  icon?: string;
}

export interface GameStats {
  score: number;
  matches: number;
  level: string;
  badge: string;
}
