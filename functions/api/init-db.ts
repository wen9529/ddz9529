// Type definitions for Cloudflare Pages Functions & D1
interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run<T = unknown>(): Promise<D1Result<T>>;
  all<T = unknown>(): Promise<D1Result<T>>;
  raw<T = unknown>(): Promise<T[]>;
}

interface D1Result<T = unknown> {
  results: T[];
  success: boolean;
  error?: string;
  meta: any;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
  dump(): Promise<ArrayBuffer>;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec(query: string): Promise<D1ExecResult>;
}

interface D1ExecResult {
  count: number;
  duration: number;
}

interface EventContext<Env, P extends string, Data> {
  request: Request;
  functionPath: string;
  waitUntil: (promise: Promise<any>) => void;
  passThroughOnException: () => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  env: Env;
  params: Record<P, string | string[]>;
  data: Data;
}

type PagesFunction<Env = unknown, Params extends string = any, Data = unknown> = (
  context: EventContext<Env, Params, Data>
) => Response | Promise<Response>;

interface Env {
  DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { env } = context;

  if (!env.DB) {
    return new Response("Database binding 'DB' not found.", { status: 500 });
  }

  try {
    // 1. Create Users Table
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        telegramId INTEGER UNIQUE NOT NULL,
        username TEXT,
        firstName TEXT,
        credits INTEGER DEFAULT 200,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        lastLoginAt DATETIME
      );
    `).run();

    // 2. Create Transactions Table
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS Transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        itemId TEXT,
        amount INTEGER,
        stars INTEGER,
        type TEXT, -- 'purchase' or 'game_fee' or 'game_reward'
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(userId) REFERENCES Users(id)
      );
    `).run();

    return new Response("Database tables created successfully! You can now use the app.", { status: 200 });
  } catch (error: any) {
    return new Response(`Error creating tables: ${error.message}`, { status: 500 });
  }
};