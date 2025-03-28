import { Server } from 'socket.io';
import http from 'http';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import winston from 'winston';

dotenv.config();
const app = express();

app.use(
  cors({
    // origin: ["http://localhost:5173"],
    origin: (origin, callback) => {
      if (origin) {
        callback(null, origin);
      } else {
        callback(null, '*');
      }
    },
    credentials: true,
    preflightContinue: false,
    allowedHeaders: ['sessionId', 'Content-Type'],
    exposedHeaders: ['sessionId'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  }),
);
app.use(express.json());
app.use(cookieParser());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const allUsers = new Map();

io.on('connection', (socket) => {
  const userId = socket.handshake.query.id;

  if (userId != 'undefined') {
    allUsers[userId] = socket.id;
  }

  io.emit('getOnlineUsers', Object.keys(allUsers));

  socket.on('disconnect', () => {
    delete allUsers[userId];
    io.emit('getOnlineUsers', Object.keys(allUsers));
  });
});

function getReceiverSocketId(id) {
  return allUsers[id];
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()],
});

export { app, logger, io, server, getReceiverSocketId };
