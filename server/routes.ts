import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Object storage image proxy route
  app.get("/api/images/:bucket/:filename(*)", async (req, res) => {
    try {
      const { bucket, filename } = req.params;
      
      // Use PBLGIC02 bucket from object storage
      const objectStorageBucket = "PBLGIC02";
      
      // Object storage URL patterns (try multiple common patterns)
      const urlPatterns = [
        // AWS S3 pattern
        `https://${objectStorageBucket}.s3.amazonaws.com/${filename}`,
        `https://s3.amazonaws.com/${objectStorageBucket}/${filename}`,
        // Google Cloud Storage pattern
        `https://storage.googleapis.com/${objectStorageBucket}/${filename}`,
        // Generic pattern
        `https://storage.cloud.google.com/${objectStorageBucket}/${filename}`,
        // Alternative S3 patterns
        `https://${objectStorageBucket}.s3.us-east-1.amazonaws.com/${filename}`,
        `https://${objectStorageBucket}.s3.ap-northeast-2.amazonaws.com/${filename}`,
      ];
      
      let imageResponse = null;
      let lastError = null;
      
      // Try each URL pattern until one works
      for (const imageUrl of urlPatterns) {
        try {
          const response = await fetch(imageUrl);
          if (response.ok) {
            imageResponse = response;
            console.log(`Successfully fetched image from: ${imageUrl}`);
            break;
          }
        } catch (error) {
          lastError = error;
          console.log(`Failed to fetch from ${imageUrl}:`, error instanceof Error ? error.message : String(error));
        }
      }
      
      if (!imageResponse) {
        console.error('All URL patterns failed for:', filename);
        return res.status(404).json({ 
          error: "Image not found", 
          bucket: objectStorageBucket,
          filename: filename,
          lastError: lastError instanceof Error ? lastError.message : String(lastError) 
        });
      }
      
      // Determine content type from file extension
      const getContentType = (filename: string): string => {
        const ext = filename.toLowerCase().split('.').pop();
        switch (ext) {
          case 'png': return 'image/png';
          case 'jpg':
          case 'jpeg': return 'image/jpeg';
          case 'gif': return 'image/gif';
          case 'webp': return 'image/webp';
          case 'svg': return 'image/svg+xml';
          default: return 'image/png';
        }
      };
      
      const contentType = getContentType(filename);
      
      // Set appropriate headers
      res.set('Content-Type', contentType);
      res.set('Cache-Control', 'public, max-age=3600');
      res.set('Access-Control-Allow-Origin', '*');
      
      // Pipe the image data
      const buffer = await imageResponse.arrayBuffer();
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
