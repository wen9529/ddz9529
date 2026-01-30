interface Env {
  BOT_TOKEN: string;
}

// Local type definitions for Cloudflare Pages environment
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

// Define shop items on server side for security
const SHOP_ITEMS: Record<string, { amount: number, label: string, description: string }> = {
  'small': { amount: 50, label: '一小袋金豆', description: '500 积分' },
  'medium': { amount: 100, label: '一大箱金豆', description: '1200 积分' },
  'large': { amount: 200, label: '金豆堆成山', description: '3000 积分' },
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  if (!env.BOT_TOKEN) {
    return new Response(JSON.stringify({ error: "Server Configuration Error: BOT_TOKEN missing" }), { status: 500 });
  }

  try {
    const body = await request.json() as { itemId: string };
    const { itemId } = body;

    const item = SHOP_ITEMS[itemId];
    if (!item) {
      return new Response(JSON.stringify({ error: "Invalid Item ID" }), { status: 400 });
    }

    // Call Telegram Bot API to create invoice link
    // Currency "XTR" is for Telegram Stars
    const payload = {
      title: item.label,
      description: item.description,
      payload: JSON.stringify({ itemId, timestamp: Date.now() }),
      provider_token: "", // Must be empty for Telegram Stars
      currency: "XTR",
      prices: [{ label: item.label, amount: item.amount }],
    };

    const tgResponse = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/createInvoiceLink`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const tgData: any = await tgResponse.json();

    if (!tgData.ok) {
        console.error("Telegram API Error:", tgData);
        throw new Error(tgData.description || "Failed to communicate with Telegram");
    }

    return new Response(JSON.stringify({ invoiceLink: tgData.result }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}