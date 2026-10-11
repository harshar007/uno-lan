import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { SERVER_CONFIG } from './config/index.js';
import { RoomManager } from './rooms/room-manager.js';
import { registerSocketHandlers } from './sockets/handlers.js';
import { getHostNetworkInfo } from './services/network-info.js';

export function createServerApp() {
  const app = express();
  const server = http.createServer(app);

  app.use(cors({ origin: '*' }));
  app.use(express.json());

  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    pingTimeout: 10000,
    pingInterval: 5000,
  });

  const roomManager = new RoomManager();
  registerSocketHandlers(io, roomManager);

  // Health and LAN discovery endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'STACK UNO Server',
      timestamp: Date.now(),
    });
  });

  app.get('/api/info', (_req, res) => {
    const network = getHostNetworkInfo(SERVER_CONFIG.PORT);
    res.json({
      name: 'STACK UNO Local Host',
      ...network,
      activeRooms: roomManager.getAllRoomsCount(),
    });
  });

  return { app, server, io, roomManager };
}

// Start server if executed directly
if (process.env.NODE_ENV !== 'test') {
  const { server } = createServerApp();
  const port = SERVER_CONFIG.PORT;
  const host = SERVER_CONFIG.HOST;

  server.listen(port, host, () => {
    const net = getHostNetworkInfo(port);
    console.log('====================================================');
    console.log('👑 STACK UNO Multiplayer LAN Server Running');
    console.log(`📡 Local Host:       http://localhost:${port}`);
    if (net.ipv4Addresses.length > 0) {
      console.log('🌐 Wi-Fi / LAN IPs for Mobile Players:');
      net.ipv4Addresses.forEach((ip) => {
        console.log(`   👉 http://${ip}:${port}`);
      });
    }
    console.log('====================================================');
  });
}
