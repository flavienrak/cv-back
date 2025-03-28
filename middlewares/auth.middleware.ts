import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/user.model.js';
import { isEmpty } from '../utils/isEmpty.js';

dotenv.config();

const checkUser = async (req, res, next) => {
  const token = req.cookies[process.env.AUTH_TOKEN_NAME];
  if (token) {
    const verify = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (verify?.infos) {
      let user = await User.findById(verify.infos.id);
      res.locals.user = user;
      next();
    } else {
      res.locals.user = null;
      res.cookie(process.env.AUTH_TOKEN_NAME, '', { maxAge: -1 });
      next();
    }
  } else {
    res.locals.user = null;
    next();
  }
};

const requireAuth = async (req, res) => {
  if (!isEmpty(res.locals.user)) {
    const token = req.cookies[process.env.AUTH_TOKEN_NAME];
    if (!isEmpty(token)) {
      const verify = jwt.verify(token, process.env.JWT_SECRET_KEY);
      if (verify?.infos) {
        return res.status(200).json({ userId: verify.infos.id });
      }
    }
  }
  return res.json({ notAuthenticated: true });
};

export { checkUser, requireAuth };
