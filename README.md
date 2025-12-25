# Vercel Server

A serverless API server built for Vercel that can be used as a backend for your applications.

## Features

- ✅ RESTful API endpoints
- ✅ CORS enabled
- ✅ Multiple HTTP methods support (GET, POST, PUT, DELETE)
- ✅ Example endpoints included
- ✅ Easy to extend

## Project Structure

```
.
├── api/
│   ├── index.js      # Main API endpoint
│   ├── hello.js      # Example GET endpoint
│   └── users.js      # Example users CRUD endpoint
├── package.json
├── vercel.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Vercel CLI (optional, for local development)

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

## Environment Variables

Create a `.env.local` file for local development or add them in Vercel Dashboard:

```
DATABASE_URL=your_database_url
API_KEY=your_api_key
```

Access them in your functions:
```javascript
const apiKey = process.env.API_KEY;
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

