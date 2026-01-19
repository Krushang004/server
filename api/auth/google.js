// Start Google OAuth flow
import { OAuth2Client } from 'google-auth-library';

function getBaseUrl(req) {
  const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}`;
}

export default async function handler(req, res) {
  // Basic CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return res.status(500).json({
      error: 'Missing GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET env vars'
    });
  }

  // Allow override, otherwise default to this server's callback URL
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI || `${getBaseUrl(req)}/auth/google/callback`;

  const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);

  const state = req.query?.state; // optional passthrough from client
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['openid', 'email', 'profile'],
    state: typeof state === 'string' ? state : undefined
  });

  // Redirect user to Google consent screen
  return res.redirect(302, url);
}


