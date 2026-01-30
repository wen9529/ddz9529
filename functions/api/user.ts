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
    const { initData } = await request.json() as { initData: string };
    
    // Validate Auth
    const user = await validateTelegramWebAppData(initData, env.BOT_TOKEN);
    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid Authentication" }), { status: 401 });
    }

    const telegramId = user.id;

    // Check if user exists
    let dbUser = await env.DB.prepare("SELECT * FROM Users WHERE telegramId = ?").bind(telegramId).first<any>();

    if (!dbUser) {
      // Create new user
      await env.DB.prepare(
        "INSERT INTO Users (telegramId, username, firstName, credits, lastLoginAt) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)"
      ).bind(telegramId, user.username || '', user.first_name, 200).run();

      dbUser = { credits: 200 };
    } else {
        // Update login time
        await env.DB.prepare("UPDATE Users SET lastLoginAt = CURRENT_TIMESTAMP WHERE telegramId = ?").bind(telegramId).run();
    }

    return new Response(JSON.stringify({ credits: dbUser.credits }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};