import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { validationResult } from 'express-validator';

import UserModel from '../models/users.model.js';
import { authTokenName, maxAgeAuthToken } from '../utils/constants.js';

dotenv.config({ path: '.env' });
const key = process.env.JWT_SECRET;

const login = async (req, res) => {
  try {
    let user = null;
    const body = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    user = await UserModel.findOne({ email: body.email });
    if (!user) {
      return res.json({ userNotFound: true });
    }

    const incorrectPassword = await bcrypt.compare(
      body.password,
      user.password,
    );

    if (!incorrectPassword) {
      return res.json({ incorrectPassword: true });
    }

    const infos = {
      id: user._id,
      authToken: true,
    };

    const authToken = jwt.sign({ infos }, key, {
      expiresIn: maxAgeAuthToken,
    });
    const cookieOptions = {
      httpOnly: true,
      secure: false,
    };
    if (body.remember) {
      cookieOptions.maxAge = maxAgeAuthToken;
    }

    res.cookie(authTokenName, authToken, cookieOptions);

    return res.status(200).json({ user: user._id });
  } catch (error) {
    return res.status(500).json({ error: `${error.message}` });
  }
};

const logout = async (req, res) => {
  res.cookie(authTokenName, '', { maxAge: -1 });
  res.redirect('/');
};

export { login, logout };
