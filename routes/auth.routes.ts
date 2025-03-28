import express from 'express';
import { login, logout } from '../controllers/auth.controller.js';
import { loginValidations } from '../validations/auth.validations.js';

const router = express.Router();

router.post('/login', loginValidations, login);
router.get('/logout', logout);

export default router;
