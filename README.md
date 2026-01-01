# Vercel Server

A serverless API server built for Vercel that can be used as a backend for your applications.

## Features

- ✅ RESTful API endpoints
- ✅ CORS enabled
- ✅ Multiple HTTP methods support (GET, POST, PUT, DELETE)
- ✅ Firebase Authentication integration
- ✅ Protected routes with JWT token verification
- ✅ Example endpoints included
- ✅ Easy to extend

## Project Structure

```
.
├── api/
│   ├── index.js           # Main API endpoint
│   ├── hello.js           # Example GET endpoint
│   ├── users.js           # Example users CRUD endpoint
│   └── auth/
│       ├── verify.js      # Verify Firebase ID token
│       ├── user.js        # Get authenticated user info
│       └── protected.js   # Example protected endpoint
├── lib/
│   ├── firebase.js        # Firebase Admin SDK initialization
│   └── authMiddleware.js  # Authentication middleware helpers
├── public/
│   └── index.html         # Welcome page
├── package.json
├── vercel.json
├── .env.example           # Environment variables template
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Vercel CLI (optional, for local development)
- Firebase project with Authentication enabled

### Installation

1. Install dependencies:
```bash
npm install
```

2. For local development:
```bash
npm run dev
```

This will start a local server at `http://localhost:3000`

### Deployment

#### Option 1: Using Vercel CLI

1. Install Vercel CLI globally:
```bash
npm i -g vercel
```

2. Deploy:
```bash
npm run deploy
```

For production:
```bash
npm run prod
```

#### Option 2: Using Vercel Dashboard

1. Push your code to GitHub, GitLab, or Bitbucket
2. Import your repository in the [Vercel Dashboard](https://vercel.com/dashboard)
3. Vercel will automatically detect and deploy your serverless functions

## API Endpoints

### Main Endpoint
- **GET/POST/PUT/DELETE** `/api` - Main API endpoint that handles all methods

### Example Endpoints
- **GET** `/api/hello?name=YourName` - Returns a greeting message
- **GET** `/api/users` - Get all users
- **GET** `/api/users?id=123` - Get a specific user by ID
- **POST** `/api/users` - Create a new user
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com"
  }
  ```

### Authentication Endpoints
- **POST** `/api/auth/verify` - Verify Firebase ID token
  - Requires: `Authorization: Bearer <firebase-id-token>` header
  - Returns: User information and token details
- **GET** `/api/auth/user` - Get authenticated user information (Protected)
  - Requires: `Authorization: Bearer <firebase-id-token>` header
  - Returns: Full user record from Firebase
- **GET** `/api/auth/protected` - Example protected endpoint
  - Requires: `Authorization: Bearer <firebase-id-token>` header
  - Returns: Protected resource with user info

## Usage Examples

### Using fetch in your frontend:

```javascript
// GET request
const response = await fetch('https://your-app.vercel.app/api/hello?name=John');
const data = await response.json();
console.log(data);

// POST request
const response = await fetch('https://your-app.vercel.app/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com'
  })
});
const data = await response.json();
console.log(data);

// Authenticated request (with Firebase token)
const token = 'your-firebase-id-token'; // Get this from Firebase Auth in your frontend
const authResponse = await fetch('https://your-app.vercel.app/api/auth/verify', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
});
const authData = await authResponse.json();
console.log(authData);

// Protected endpoint
const protectedResponse = await fetch('https://your-app.vercel.app/api/auth/protected', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
  }
});
const protectedData = await protectedResponse.json();
console.log(protectedData);
```

## Adding New Endpoints

1. Create a new file in the `api/` directory (e.g., `api/products.js`)
2. Export a default async function that handles `req` and `res`:

```javascript
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Your endpoint logic here
  res.status(200).json({ message: 'Hello from new endpoint' });
}
```

3. Access it at `/api/products`

### Creating Protected Endpoints

To create an endpoint that requires authentication, use the `requireAuth` middleware:

```javascript
import { requireAuth } from '../../lib/authMiddleware.js';

async function handler(req, res) {
  // req.user contains the decoded token
  // req.uid contains the user ID
  res.status(200).json({
    message: 'This is protected',
    userId: req.uid,
    userEmail: req.user.email
  });
}

export default requireAuth(handler);
```

## Firebase Setup

### 1. Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Click the gear icon ⚙️ → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Download the JSON file

### 2. Configure Environment Variables

#### Option 1: Service Account Key (Recommended)

Add the entire service account JSON as a single environment variable:

**For Local Development:**
Create a `.env.local` file:
```
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project-id",...}
```

**For Vercel Deployment:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add `FIREBASE_SERVICE_ACCOUNT_KEY` with the entire JSON content (as a single line)

#### Option 2: Individual Variables (Alternative)

If you prefer separate variables:
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
```

### 3. Enable Firebase Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Get Started**
3. Enable your preferred sign-in methods (Email/Password, Google, etc.)

## Environment Variables

Create a `.env.local` file for local development or add them in Vercel Dashboard:

```
# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# Or use individual variables:
# FIREBASE_PROJECT_ID=your-project-id
# FIREBASE_CLIENT_EMAIL=your-service-account-email
# FIREBASE_PRIVATE_KEY="your-private-key"
```

Access them in your functions:
```javascript
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
```

## Notes

- All files in the `api/` directory automatically become API routes
- The route path is based on the file name (e.g., `api/users.js` → `/api/users`)
- Each function should export a default async handler
- CORS is enabled by default, but you can restrict origins in production

## Support

For more information, visit:
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)

