import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';

import { validationResult } from 'express-validator';
import { fileURLToPath } from 'url';

import UserModel from '../models/users.model.js';
import FileModel from '../models/files.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getAll = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const users = await UserModel.find()
      .select('-password')
      .sort({ createdAt: -1 });

    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).json({ error: `${error.message}` });
  }
};

const create = async (req, res) => {
  try {
    let user = null;
    const body = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    user = await UserModel.findOne({ email: body.email });
    if (user) {
      return res.json({ userAlreadyExist: true });
    }

    const salt = await bcrypt.genSalt();
    const password = await bcrypt.hash(body.password, salt);

    user = await UserModel.create({
      nom: body.nom,
      email: body.email,
      admin: body.admin ? body.admin : false,
      password,
    });

    return res.status(200).json({ user: user._id });
  } catch (error) {
    return res.status(500).json({ error: `${error.message}` });
  }
};

const update = async (req, res) => {
  try {
    let user = null;
    let fileName = null;
    const body = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const infos = {
      nom: body.nom,
      biographie: body.biographie,
    };

    if (body.password) {
      const incorrectPassword = await bcrypt.compare(
        body.password,
        res.locals.user.password,
      );

      if (!incorrectPassword) {
        return res.json({ incorrectPassword: true });
      }
      const salt = await bcrypt.genSalt();
      const newPassword = await bcrypt.hash(body.password, salt);
      infos.password = newPassword;
    }

    if (req.file) {
      if (req.file.mimetype.startsWith('image/')) {
        const extension = path.extname(req.file.originalname);
        fileName = `${res.locals.user._id}${extension}`;
        const directoryPath = path.join(__dirname, `../uploads/profiles`);
        const filePath = path.join(directoryPath, fileName);

        if (!fs.existsSync(directoryPath)) {
          fs.mkdirSync(directoryPath, { recursive: true });
        }
        fs.writeFileSync(filePath, req.file.buffer);

        const existingFile = await FileModel.find({ filename: fileName });
        if (!existingFile) {
          await FileModel.create({
            user: res.locals.user._id,
            extension,
            filename: fileName,
            originalName: req.file.originalname,
          });
        }

        infos.image = fileName;
      }
    }

    user = await UserModel.findByIdAndUpdate(
      res.locals.user._id,
      { $set: infos },
      { new: true },
    );

    const { password, ...userWithoutPassword } = user._doc;

    return res.status(200).json({ user: userWithoutPassword });
  } catch (error) {
    return res.status(500).json({ error: `${error.message}` });
  }
};

export { getAll, create, update };
