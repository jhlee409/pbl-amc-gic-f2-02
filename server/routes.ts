import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Supabase image proxy route
  app.get("/api/images/:bucket/:filename(*)", async (req, res) => {
    try {
      const { bucket, filename } = req.params;
      const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        return res.status(500).json({ error: "Supabase configuration missing" });
      }

      // Construct Supabase storage URL
      const imageUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${filename}`;
      
      // Fetch image from Supabase
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        return res.status(404).json({ error: "Image not found" });
      }
      
      // Get content type
      const contentType = response.headers.get('content-type') || 'image/png';
      
      // Set appropriate headers
      res.set('Content-Type', contentType);
      res.set('Cache-Control', 'public, max-age=3600');
      
      // Pipe the image data
      const buffer = await response.arrayBuffer();
      res.send(Buffer.from(buffer));
      
    } catch (error) {
      console.error('Error fetching image:', error);
      res.status(500).json({ error: "Failed to fetch image" });
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
