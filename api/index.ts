import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Express 앱을 전역으로 초기화
let app: express.Application | null = null;
let isInitialized = false;

async function initializeApp() {
  if (isInitialized) return app;
  
  app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "…";
        }

        log(logLine);
      }
    });

    next();
  });

  // 라우트 등록
  await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    console.error('Express error:', err);
  });

  // 프로덕션에서는 정적 파일 서빙
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  }

  isInitialized = true;
  return app;
}

// Vercel 서버리스 함수를 위한 핸들러
export default async function handler(req: Request, res: Response) {
  try {
    // Express 앱 초기화
    const expressApp = await initializeApp();
    
    if (!expressApp) {
      return res.status(500).json({ error: "Failed to initialize application" });
    }

    // Express 앱으로 요청 처리
    return new Promise((resolve, reject) => {
      expressApp!(req, res, (err: any) => {
        if (err) {
          console.error('Request handling error:', err);
          reject(err);
        } else {
          resolve(undefined);
        }
      });
    });
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
}
