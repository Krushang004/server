// Authentication middleware helper
import { auth } from './firebase.js';

/**
 * Verify Firebase ID token from Authorization header
 * @param {string} authHeader - Authorization header value (format: "Bearer <token>")
 * @returns {Promise<Object>} Decoded token with user information
 */
export async function verifyToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Authorization header missing or invalid format');
  }

  const token = authHeader.split('Bearer ')[1];
  
  if (!token) {
    throw new Error('Token not provided');
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    if (error.code === 'auth/id-token-expired') {
      throw new Error('Token has expired');
    } else if (error.code === 'auth/argument-error') {
      throw new Error('Invalid token format');
    } else {
      throw new Error('Token verification failed: ' + error.message);
    }
  }
}

/**
 * Get user by UID
 * @param {string} uid - Firebase user UID
 * @returns {Promise<Object>} User record
 */
export async function getUserByUid(uid) {
  try {
    const user = await auth.getUser(uid);
    return user;
  } catch (error) {
    throw new Error('Failed to get user: ' + error.message);
  }
}

/**
 * Middleware function to protect routes
 * Use this in your API endpoints to require authentication
 */
export function requireAuth(handler) {
  return async (req, res) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Credentials', true);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
      res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
      );
      return res.status(200).end();
    }

    try {
      const authHeader = req.headers.authorization;
      const decodedToken = await verifyToken(authHeader);
      
      // Attach user info to request object
      req.user = decodedToken;
      req.uid = decodedToken.uid;
      
      // Call the actual handler
      return handler(req, res);
    } catch (error) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(401).json({
        error: 'Unauthorized',
        message: error.message
      });
    }
  };
}

