// Get user information by UID endpoint
import { requireAuth, getUserByUid } from '../../lib/authMiddleware.js';

async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      // Get user info from authenticated token
      const userRecord = await getUserByUid(req.uid);

      res.status(200).json({
        success: true,
        user: {
          uid: userRecord.uid,
          displayName: userRecord.displayName,
          email: userRecord.email,
          emailVerified: userRecord.emailVerified,
          phoneNumber: userRecord.phoneNumber,
          photoURL: userRecord.photoURL,
          disabled: userRecord.disabled,
          customClaims: userRecord.customClaims,
          metadata: {
            creationTime: userRecord.metadata.creationTime,
            lastSignInTime: userRecord.metadata.lastSignInTime,
            lastRefreshTime: userRecord.metadata.lastRefreshTime
          },
          providerData: userRecord.providerData
        }
      });
    } else {
      res.status(405).json({
        error: 'Method not allowed',
        allowedMethods: ['GET']
      });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get user information',
      message: error.message
    });
  }
}

// Export with authentication middleware
export default requireAuth(handler);


