import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const invalidCredentials = 'Invalid username or password.';
const encoder = new TextEncoder();

interface RequestBody {
  action?: 'sign_in' | 'request_password_reset';
  username?: string;
  identifier?: string;
  password?: string;
}

function respond(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function requiredEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing Edge Function secret: ${name}`);
  return value;
}

async function hmac(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function resolveEmail(
  identifier: string,
  admin: SupabaseClient,
): Promise<{ email: string; active: boolean } | null> {
  if (identifier.includes('@')) {
    return { email: identifier.toLowerCase(), active: true };
  }

  if (!/^[a-z0-9._-]{3,30}$/.test(identifier)) return null;

  const { data: profiles, error: profileError } = await admin
    .from('profiles')
    .select('id, account_status')
    .eq('username', identifier)
    .limit(2);
  if (profileError) throw profileError;
  if (profiles?.length !== 1) return null;

  const profile = profiles[0];
  const { data, error } = await admin.auth.admin.getUserById(profile.id);
  if (error) throw error;
  if (!data.user?.email) return null;

  return {
    email: data.user.email,
    active: profile.account_status === 'active',
  };
}

Deno.serve(async (request: Request): Promise<Response> => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return respond(405, { error: 'Method not allowed.' });

  let parsedBody: unknown;
  try {
    parsedBody = await request.json();
  } catch {
    return respond(400, { error: 'Invalid request.' });
  }
  if (!parsedBody || typeof parsedBody !== 'object' || Array.isArray(parsedBody)) {
    return respond(400, { error: 'Invalid request.' });
  }
  if (encoder.encode(JSON.stringify(parsedBody)).length > 4096) {
    return respond(413, { error: 'Request is too large.' });
  }

  const body = parsedBody as RequestBody;
  const action = body.action;
  const rawIdentifier = action === 'sign_in' ? body.username : body.identifier;
  const identifier = typeof rawIdentifier === 'string'
    ? rawIdentifier.trim().toLowerCase()
    : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (
    (action !== 'sign_in' && action !== 'request_password_reset')
    || !identifier
    || identifier.length > 254
    || (action === 'sign_in'
      && (typeof password !== 'string' || !password || password.length > 1024))
  ) {
    return respond(400, { error: 'Invalid request.' });
  }

  try {
    const url = requiredEnv('SUPABASE_URL');
    const anonKey = requiredEnv('SUPABASE_ANON_KEY');
    const serviceKey = requiredEnv('SUPABASE_SERVICE_ROLE_KEY');
    const hmacSecret = requiredEnv('USERNAME_LOGIN_RATE_LIMIT_SECRET');
    if (hmacSecret.length < 32) {
      throw new Error('USERNAME_LOGIN_RATE_LIMIT_SECRET must contain at least 32 characters.');
    }
    const admin = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const auth = createClient(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const source =
      request.headers.get('cf-connecting-ip')
      ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? request.headers.get('x-real-ip')
      ?? 'unknown';
    const subjectHash = await hmac(`subject:${identifier}`, hmacSecret);
    const sourceHash = await hmac(`source:${source}`, hmacSecret);
    const { data: allowed, error: rateLimitError } = await admin.rpc(
      'consume_username_login_rate_limit',
      { p_subject_hash: subjectHash, p_source_hash: sourceHash },
    );
    if (rateLimitError) throw rateLimitError;
    if (!allowed) return respond(429, { error: invalidCredentials });

    const account = await resolveEmail(identifier, admin);
    if (action === 'request_password_reset') {
      if (account?.active) {
        const { error } = await auth.auth.resetPasswordForEmail(account.email);
        if (error) throw error;
      }
      return respond(200, { ok: true });
    }

    if (!account?.active) {
      const { error } = await auth.auth.signInWithPassword({
        email: `unknown-${subjectHash.slice(0, 20)}@invalid.invalid`,
        password,
      });
      if (error?.status && error.status >= 500) throw error;
      return respond(401, { error: invalidCredentials });
    }

    const { data, error } = await auth.auth.signInWithPassword({
      email: account.email,
      password,
    });
    if (error?.status && error.status >= 500) throw error;
    if (error || !data.session) return respond(401, { error: invalidCredentials });

    return respond(200, {
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      },
    });
  } catch (error) {
    console.error('Username authentication failed:', error);
    return respond(500, { error: 'Authentication service is temporarily unavailable.' });
  }
});
