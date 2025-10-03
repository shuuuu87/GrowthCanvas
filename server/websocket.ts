import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { storage } from './storage';

interface ChatClient {
  ws: WebSocket;
  userId: string;
  username: string;
}

const clients = new Set<ChatClient>();

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws/chat' });

  wss.on('connection', (ws: WebSocket) => {
    let client: ChatClient | null = null;

    ws.on('message', async (data: string) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === 'auth') {
          client = {
            ws,
            userId: message.userId,
            username: message.username,
          };
          clients.add(client);
          
          ws.send(JSON.stringify({
            type: 'connected',
            message: 'Connected to chat',
          }));
        } else if (message.type === 'message' && client) {
          const chatMessage = await storage.createChatMessage({
            userId: client.userId,
            username: client.username,
            content: message.content,
          });

          const broadcastMessage = JSON.stringify({
            type: 'message',
            data: chatMessage,
          });

          clients.forEach((c) => {
            if (c.ws.readyState === WebSocket.OPEN) {
              c.ws.send(broadcastMessage);
            }
          });
        }
      } catch (error) {
        console.error('WebSocket error:', error);
      }
    });

    ws.on('close', () => {
      if (client) {
        clients.delete(client);
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket client error:', error);
    });
  });

  return wss;
}
