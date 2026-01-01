// Example protected endpoint - requires authentication
import { requireAuth } from '../../lib/authMiddleware.js';

async function handler(req, res) {
  // This endpoint is protected - only authenticated users can access it
  // The user information is available in req.user and req.uid
  
  res.status(200).json({
    message: 'This is a protected endpoint',
    user: {
      uid: req.uid,
      email: req.user.email,
      name: req.user.name
    },
    timestamp: new Date().toISOString(),
    method: req.method
  });
}

// Export with authentication middleware
export default requireAuth(handler);

