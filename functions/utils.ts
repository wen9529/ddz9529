interface Env {
  BOT_TOKEN: string;
}

/**
 * Validates the Telegram WebApp initData to ensure the request is from a legitimate user.
 */
export async function validateTelegramWebAppData(initData: string, botToken: string): Promise<any | null> {
  if (!initData || !botToken) return null;

  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  urlParams.delete('hash');

  // Sort parameters alphabetically
  const params: string[] = [];
  for (const [key, value] of urlParams.entries()) {
    params.push(`${key}=${value}`);
  }
  params.sort();
  const dataCheckString = params.join('\n');

  // Create Secret Key
  const encoder = new TextEncoder();
  const secretKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode('WebAppData'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const secretKeyBytes = await crypto.subtle.sign(
    'HMAC',
    secretKey,
    encoder.encode(botToken)
  );

  const key = await crypto.subtle.importKey(
    'raw',
    secretKeyBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  // Calculate Hash
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(dataCheckString)
  );

  // Convert signature to hex string
  const signatureArray = Array.from(new Uint8Array(signature));
  const signatureHex = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');

  if (signatureHex === hash) {
    const userStr = urlParams.get('user');
    if (userStr) {
        return JSON.parse(userStr);
    }
  }
  
  return null;
}