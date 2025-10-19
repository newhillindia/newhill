import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';

const router = Router();

// Mock user data
const users = [
  {
    id: 1,
    email: 'admin@newhillspices.com',
    name: 'Admin User',
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    email: 'customer@example.com',
    name: 'John Doe',
    role: 'customer',
    createdAt: new Date().toISOString(),
  },
];

router.get('/', async (req: Request, res: Response) => {
  try {
    logger.info('Users fetched', { count: users.length });
    
    res.json({
      success: true,
      data: { users },
    });
  } catch (error) {
    logger.error('Error fetching users', { error });
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch users' },
    });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = users.find(u => u.id === Number(id));
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' },
      });
    }
    
    logger.info('User fetched', { userId: id });
    
    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    logger.error('Error fetching user', { error, userId: req.params.id });
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch user' },
    });
  }
});

export default router;
