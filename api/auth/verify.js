// Verify Firebase ID token endpoint
import { verifyToken, getUserByUid } from '../../lib/authMiddleware.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      allowedMethods: ['POST']
    });
  }

  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(400).json({
        error: 'Authorization header required',
        message: 'Please provide Authorization header with Bearer token'
      });
    }

    // Verify the token
    const decodedToken = await verifyToken(authHeader);
    
    // Get additional user information
    const userRecord = await getUserByUid(decodedToken.uid);

    res.status(200).json({
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
        name: decodedToken.name,
        picture: decodedToken.picture,
        firebase: {
          identities: decodedToken.firebase.identities,
          sign_in_provider: decodedToken.firebase.sign_in_provider
        },
        customClaims: decodedToken,
        userRecord: {
          displayName: userRecord.displayName,
          email: userRecord.email,
          emailVerified: userRecord.emailVerified,
          phoneNumber: userRecord.phoneNumber,
          photoURL: userRecord.photoURL,
          disabled: userRecord.disabled,
          metadata: {
            creationTime: userRecord.metadata.creationTime,
            lastSignInTime: userRecord.metadata.lastSignInTime
          }
        }
      }
    });
  } catch (error) {
    res.status(401).json({
      error: 'Token verification failed',
      message: error.message
    });
  }
}


