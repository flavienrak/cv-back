import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import sequelize from './bd.js';

dotenv.config();

import { app, server } from './socket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Synchronized PostgresSQL
sequelize.sync().then(() => console.log('PostgresSQL synchronized'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  return res.json('Backend running successfully!');
});
app.get('/api/*', checkUser);
app.get('/api/jwtid', requireAuth);

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

const port = process.env.BACKEND_PORT || 5000;
server.listen(port, () => console.log(`App runing at: ${port}`));
