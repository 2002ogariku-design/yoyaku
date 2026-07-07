import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { WebSocketServer, WebSocket } from "ws";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

// WebSocket接続を管理するマップ
const connectedClients = new Map<string, Set<WebSocket>>();

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  
  // WebSocketサーバーを作成
  const wss = new WebSocketServer({ server });

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // WebSocket接続処理
  wss.on("connection", (ws: WebSocket) => {
    let userId: string | null = null;

    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        // ユーザーIDを登録
        if (message.type === "register" && message.userId) {
          const newUserId = String(message.userId);
          userId = newUserId;
          if (!connectedClients.has(newUserId)) {
            connectedClients.set(newUserId, new Set<WebSocket>());
          }
          const clients = connectedClients.get(newUserId);
          if (clients) {
            clients.add(ws);
            console.log(`User ${newUserId} connected. Total clients: ${clients.size}`);
          }
        }
        
        // データ更新を他のクライアントに配信
        if (message.type === "update" && userId) {
          const clients = connectedClients.get(userId);
          if (clients) {
            const response = JSON.stringify({
              type: "update",
              data: message.data,
              timestamp: new Date().toISOString(),
            });
            
            clients.forEach((client: WebSocket) => {
              if (client.readyState === 1) { // WebSocket.OPEN
                client.send(response);
              }
            });
          }
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });

    ws.on("close", () => {
      if (userId) {
        const clients = connectedClients.get(userId);
        if (clients) {
          clients.delete(ws);
          console.log(`User ${userId} disconnected. Remaining clients: ${clients.size}`);
          if (clients.size === 0) {
            connectedClients.delete(userId);
          }
        }
      }
    });

    ws.on("error", (error: Error) => {
      console.error("WebSocket error:", error);
    });
  });

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
