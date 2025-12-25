// Main API endpoint - handles all HTTP methods
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      res.status(200).json({
        message: 'Welcome to Vercel Server API',
        method: 'GET',
        timestamp: new Date().toISOString(),
        query: req.query,
        path: req.url
      });
      break;

    case 'POST':
      res.status(200).json({
        message: 'POST request received',
        method: 'POST',
        timestamp: new Date().toISOString(),
        body: req.body,
        path: req.url
      });
      break;

    case 'PUT':
      res.status(200).json({
        message: 'PUT request received',
        method: 'PUT',
        timestamp: new Date().toISOString(),
        body: req.body,
        path: req.url
      });
      break;

    case 'DELETE':
      res.status(200).json({
        message: 'DELETE request received',
        method: 'DELETE',
        timestamp: new Date().toISOString(),
        query: req.query,
        path: req.url
      });
      break;

    default:
      res.status(405).json({
        error: 'Method not allowed',
        allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      });
  }
}

