import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Supabase storage image proxy route
  app.get("/api/images/:bucket/:filename(*)", async (req, res) => {
    try {
      const { bucket, filename } = req.params;
      
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        return res.status(500).json({ error: "Supabase configuration missing" });
      }
      
      // Construct Supabase storage URL
      const supabaseUrl = process.env.SUPABASE_URL;
      const imageUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${filename}`;
      
      console.log(`Fetching image from Supabase: ${imageUrl}`);
      
      // Fetch image from Supabase storage
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        console.error(`Supabase storage error: ${response.status} ${response.statusText}`);
        return res.status(404).json({ 
          error: "Image not found", 
          bucket: bucket,
          filename: filename,
          supabaseUrl: imageUrl,
          status: response.status
        });
      }
      
      // Check if response is actually an image
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        console.error(`Invalid content type from Supabase: ${contentType}`);
        return res.status(404).json({ error: "Not an image file" });
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
      
    } catch (error) {
      console.error('Error fetching image from Supabase:', error);
      res.status(500).json({ error: "Failed to fetch image from Supabase" });
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
