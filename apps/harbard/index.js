// index.js
import express from "express";
import bodyParser from "body-parser";
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import mongoose from 'mongoose';

import visit from "./routes/register/visit.js";
import blocks from "./routes/blocks/blocks.js";
import { handleSocketJoinPage, handleSocketLeavePage } from "./sockets/page.js";

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.BASE_URL,
  }
});


/**
 * Connects to mongodb
 */
try {
  const MONGO_URL = process.env.NODE_ENV === 'production' ? process.env.PRODUCTION_MONGO_URL : process.env.DEVELOPMENT_MONGO_URL
  await mongoose.connect(process.env.PRODUCTION_MONGO_URL);
  console.log("DB connection true");
} catch(error) {
  console.log("DB connection failed: " + error);
}

app.use(cors({
  origin: process.env.BASE_URL,
  credentials: true
}));
app.use(bodyParser.json());
// ADD MIDDLEWARE FOR AUTHENTICATION

/**
 * Register routes
 */
app.use('/register/visit' ,visit(io));
app.use('/blocks' ,blocks(io));

/**
 * Websockets
 */
io.on('connection', (socket) => {
  console.log('User connected: ' + socket.id);

  socket.on('page:join', handleSocketJoinPage(io, socket))
  socket.on('page:leave', handleSocketLeavePage(io, socket))

  socket.on('room:join', (room) => {
    socket.join(room);
  });

  socket.on('room:leave', (room) => {
    socket.leave(room);
  });

  socket.on('room:emit', (room) => {
    io.to(room).emit('message', `${room}: Emit`)
  })

  socket.on('disconnect', (data) => {
    console.log('User disconnected: ' + socket.id);
  });
});

/**
 * Final setup for Express
 */
const port = process.env.API_PORT || 3001;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
