// Google OAuth callback: exchange code -> verify Google ID token -> create/get Firebase user -> mint Firebase custom token
import { OAuth2Client } from 'google-auth-library';
import { getAuth } from '../../../lib/firebase.js';

function getBaseUrl(req) {
  const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}`;
}

function safeRedirect(res, url) {
  // Prevent open redirects (very basic: allow only absolute https? or relative)
  try {
    if (!url) return false;
    if (url.startsWith('/')) {
      res.redirect(302, url);
      return true;
    }
    const u = new URL(url);
    if (u.protocol === 'https:' || u.protocol === 'http:') {
      res.redirect(302, u.toString());
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
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

  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI || `${getBaseUrl(req)}/auth/google/callback`;

  const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);

  const code = typeof req.query?.code === 'string' ? req.query.code : null;
  if (!code) {
    return res.status(400).json({ error: 'Missing ?code from Google callback' });
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens?.id_token) {
      return res.status(400).json({ error: 'No id_token received from Google' });
    }

    // Verify Google ID token
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: clientId
    });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload?.email) {
      return res.status(400).json({ error: 'Google token payload missing sub/email' });
    }

    // Initialize Firebase Auth
    let firebaseAuth;
    try {
      firebaseAuth = getAuth();
    } catch (firebaseError) {
      return res.status(500).json({
        error: 'Firebase not configured',
        message: firebaseError.message || 'Please set FIREBASE_SERVICE_ACCOUNT_KEY in Vercel environment variables'
      });
    }

    // Create/get Firebase user
    const uid = `google:${payload.sub}`;
    let userRecord;
    try {
      userRecord = await firebaseAuth.getUser(uid);
    } catch (e) {
      // Create user if not found
      userRecord = await firebaseAuth.createUser({
        uid,
        email: payload.email,
        emailVerified: !!payload.email_verified,
        displayName: payload.name,
        photoURL: payload.picture
      });
    }

    // Mint a Firebase custom token for this uid
    const customToken = await firebaseAuth.createCustomToken(userRecord.uid, {
      provider: 'google',
      email: payload.email
    });

    // Where to send user after success:
    // - Prefer FRONTEND_REDIRECT_URL env var (e.g. https://yourapp.com/auth/callback)
    // - Or allow ?redirect=... as query param
    const redirectParam = typeof req.query?.redirect === 'string' ? req.query.redirect : null;
    const frontendRedirect = redirectParam || process.env.FRONTEND_REDIRECT_URL;

    if (frontendRedirect) {
      const target = new URL(frontendRedirect, frontendRedirect.startsWith('/') ? getBaseUrl(req) : undefined);
      target.searchParams.set('firebaseCustomToken', customToken);
      if (typeof req.query?.state === 'string') target.searchParams.set('state', req.query.state);
      if (safeRedirect(res, target.toString())) return;
    }

    // Fallback: show token as JSON (useful for testing)
    return res.status(200).json({
      success: true,
      uid: userRecord.uid,
      email: userRecord.email,
      firebaseCustomToken: customToken
    });
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    
    // Provide helpful error messages
    let errorMessage = error?.message || String(error);
    if (errorMessage.includes('ENOTFOUND metadata.google.internal') || 
        errorMessage.includes('Failed to determine project ID')) {
      errorMessage = 'Firebase Admin SDK not configured. Please set FIREBASE_SERVICE_ACCOUNT_KEY in Vercel environment variables. ' +
        'Get it from Firebase Console > Project Settings > Service Accounts > Generate New Private Key';
    }
    
    return res.status(500).json({
      error: 'Google OAuth callback failed',
      message: errorMessage
    });
  }
}


