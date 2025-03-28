import express from 'express';
import multer from 'multer';

import { getAll, update, create } from '../controllers/user.controller.js';
import {
  createUserValidations,
  updateUserValidations,
} from '../validations/users.validations.js';
import { isAuthenticated } from '../middleware/auth.middleware.js';

const upload = multer();
const router = express.Router();

router.get('/get-all', isAuthenticated, getAll);
router.post('/create-user', createUserValidations, create);
router.post(
  '/update-user',
  upload.single('file'),
  isAuthenticated,
  updateUserValidations,
  update
);

export default router;
