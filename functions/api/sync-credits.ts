import { validateTelegramWebAppData } from '../utils';

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
  BOT_TOKEN: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const { initData, change, reason } = await request.json() as { initData: string, change: number, reason: string };
    
    const user = await validateTelegramWebAppData(initData, env.BOT_TOKEN);
    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid Authentication" }), { status: 401 });
    }

    const telegramId = user.id;

    // Get current User ID and Credits
    const dbUser: any = await env.DB.prepare("SELECT id, credits FROM Users WHERE telegramId = ?").bind(telegramId).first();
    
    if (!dbUser) {
        return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    const newCredits = dbUser.credits + change;
    
    if (newCredits < 0) {
        return new Response(JSON.stringify({ error: "Insufficient credits" }), { status: 400 });
    }

    // Update Credits
    await env.DB.prepare("UPDATE Users SET credits = ? WHERE id = ?").bind(newCredits, dbUser.id).run();

    // Log Transaction (optional, but good for tracking)
    // We log it loosely here without strict transaction for simplicity in this demo
    if (reason) {
        await env.DB.prepare("INSERT INTO Transactions (userId, amount, type) VALUES (?, ?, ?)")
            .bind(dbUser.id, change, reason)
            .run();
    }

    return new Response(JSON.stringify({ success: true, credits: newCredits }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};