# Firebase Authentication Setup Guide

## Quick Setup Steps

### 1. Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Click the gear icon ⚙️ → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Download the JSON file

### 2. Configure Environment Variables

#### For Local Development

Create a `.env.local` file in the root directory:

```env
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project-id","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}
```

**Important:** Paste the entire JSON content as a single line, or use `JSON.stringify()` to convert it.

#### Alternative: Individual Variables

If you prefer separate environment variables:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
```

**Note:** Make sure to include the newline characters (`\n`) in the private key.

#### For Vercel Deployment

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add `FIREBASE_SERVICE_ACCOUNT_KEY` with the entire JSON content
5. Make sure to add it for **Production**, **Preview**, and **Development** environments
6. Redeploy your application

## Google OAuth Setup (for /auth/google/callback)

If you want to use the URL you mentioned (example: `https://server-coral-ten.vercel.app/auth/google/callback`), you must configure Google OAuth.

### 1) Create OAuth client

1. Go to Google Cloud Console → APIs & Services → Credentials
2. Create **OAuth client ID** (Web application)
3. Add **Authorized redirect URI**:
   - `https://server-coral-ten.vercel.app/auth/google/callback`
4. Copy the **Client ID** and **Client Secret**

### 2) Add env vars in Vercel

In Vercel Dashboard → Project → Settings → Environment Variables, add:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `FRONTEND_REDIRECT_URL` (where to send the user after login; your app’s page)

Optional:
- `GOOGLE_REDIRECT_URI` (if not set, server uses `https://<current-domain>/auth/google/callback`)

### 3. Enable Firebase Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Get Started**
3. Enable your preferred sign-in methods:
   - Email/Password
   - Google
   - Facebook
   - etc.

### 4. Install Dependencies

```bash
npm install
```

This will install `firebase-admin` package.

## Testing the Setup

### 1. Get a Firebase ID Token from Your Frontend

In your frontend application, after a user signs in:

```javascript
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const auth = getAuth();
const userCredential = await signInWithEmailAndPassword(auth, email, password);
const token = await userCredential.user.getIdToken();
```

### 2. Test the Verify Endpoint

```javascript
const response = await fetch('https://your-app.vercel.app/api/auth/verify', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
});

const data = await response.json();
console.log(data);
```

### 3. Test a Protected Endpoint

```javascript
const response = await fetch('https://your-app.vercel.app/api/auth/protected', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
  }
});

const data = await response.json();
console.log(data);
```

## Testing Google OAuth

1. Open:
   - `https://server-coral-ten.vercel.app/auth/google?redirect=https://your-frontend.example/auth/callback`
2. After Google login, your frontend redirect URL will receive:
   - `?firebaseCustomToken=...`
3. In your frontend, exchange it for a Firebase ID token:

```javascript
import { getAuth, signInWithCustomToken } from 'firebase/auth';

const auth = getAuth();
const userCred = await signInWithCustomToken(auth, firebaseCustomToken);
const idToken = await userCred.user.getIdToken();
```

4. Call protected APIs with:
   - `Authorization: Bearer <idToken>`

## Troubleshooting

### Error: "Failed to initialize Firebase Admin SDK"

- Make sure `FIREBASE_SERVICE_ACCOUNT_KEY` is set correctly
- Verify the JSON is valid and complete
- Check that all required fields are present in the service account key

### Error: "Token verification failed"

- Ensure the token is not expired
- Verify the token is from the same Firebase project
- Check that Firebase Authentication is enabled in your project

### Error: "Authorization header missing"

- Make sure you're sending the `Authorization` header
- Format should be: `Authorization: Bearer <token>`
- Verify the token is included in the header

## Security Notes

- Never commit `.env.local` or service account keys to Git
- Keep your service account keys secure
- Use environment variables in Vercel, never hardcode credentials
- Consider restricting CORS origins in production


