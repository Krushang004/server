// Example users endpoint - demonstrates POST and GET
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // In-memory storage (use a database in production)
  // This is just for demonstration
  if (!global.users) {
    global.users = [];
  }

  switch (req.method) {
    case 'GET':
      // Get all users or a specific user by ID
      const { id } = req.query;
      
      if (id) {
        const user = global.users.find(u => u.id === id);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json(user);
      }

      res.status(200).json({
        users: global.users,
        count: global.users.length
      });
      break;

    case 'POST':
      // Create a new user
      const { name, email } = req.body;

      if (!name || !email) {
        return res.status(400).json({
          error: 'Name and email are required'
        });
      }

      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        createdAt: new Date().toISOString()
      };

      global.users.push(newUser);

      res.status(201).json({
        message: 'User created successfully',
        user: newUser
      });
      break;

    default:
      res.status(405).json({
        error: 'Method not allowed',
        allowedMethods: ['GET', 'POST']
      });
  }
}

