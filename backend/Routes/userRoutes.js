import express from 'express';
import { registerUser,loginUser,getMe } from '../Controllers/userController.js';
import { protect } from '../Middleware/userMiddleware.js';


const router = express.Router();

router.post('/register',registerUser);
router.post('/login',loginUser);
router.get('/me', protect, getMe);

export default router;  