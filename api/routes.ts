import type { Application } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Application): Promise<Server> {
  // Test endpoint for debugging
  app.get("/api/test", (req, res) => {
    res.json({
      message: "API is working",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      supabaseUrl: process.env.VITE_SUPABASE_URL ? 'SET' : 'MISSING',
      supabaseKey: process.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING'
    });
  });

  // Supabase storage image proxy route
  app.get("/api/images/:bucket/:filename(*)", async (req, res) => {
    try {
      const { bucket, filename } = req.params;
      
      console.log('Image request:', { bucket, filename });
      console.log('Environment variables check:', {
        VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL ? 'SET' : 'MISSING',
        VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING'
      });
      
      if (!process.env.VITE_SUPABASE_URL) {
        console.error('VITE_SUPABASE_URL is missing');
        return res.status(500).json({ 
          error: "Supabase URL configuration missing",
          details: "VITE_SUPABASE_URL environment variable is not set"
        });
      }
      
      // Construct Supabase storage URL
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const imageUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${filename}`;
      
      console.log(`Fetching image from Supabase: ${imageUrl}`);
      
      // Fetch image from Supabase storage with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃
      
      try {
        const response = await fetch(imageUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; Vercel-Image-Proxy/1.0)'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          console.error(`Supabase storage error: ${response.status} ${response.statusText}`);
          return res.status(response.status).json({ 
            error: "Image not found", 
            bucket: bucket,
            filename: filename,
            supabaseUrl: imageUrl,
            status: response.status,
            statusText: response.statusText
          });
        }
        
        // Check if response is actually an image
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.startsWith('image/')) {
          console.error(`Invalid content type from Supabase: ${contentType}`);
          return res.status(404).json({ 
            error: "Not an image file",
            contentType: contentType
          });
        }
        
        // Set appropriate headers
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=3600');
        res.setHeader('Access-Control-Allow-Origin', '*');
        
        // Stream the image data
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        console.log(`Serving image from Supabase: ${filename}, size: ${buffer.length} bytes, type: ${contentType}`);
        res.send(buffer);
        
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          console.error('Image fetch timeout');
          return res.status(504).json({ error: "Image fetch timeout" });
        }
        throw fetchError;
      }
      
    } catch (error: any) {
      console.error('Error fetching image from Supabase:', error);
      res.status(500).json({ 
        error: "Failed to fetch image from Supabase",
        details: error.message
      });
    }
  });

  // PBL session management
  app.get("/api/pbl/session/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const session = await storage.getPblSession(userId);
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to get session" });
    }
  });

  app.post("/api/pbl/session", async (req, res) => {
    try {
      const session = await storage.createPblSession(req.body);
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  app.put("/api/pbl/session/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const session = await storage.updatePblSession(id, req.body);
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to update session" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
