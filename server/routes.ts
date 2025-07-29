import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple test endpoint
  app.get("/api/test-image", (req, res) => {
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Send a simple 1x1 transparent PNG
    const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    res.send(buffer);
  });

  // Object storage image proxy route
  app.get("/api/images/:bucket/:filename(*)", async (req, res) => {
    try {
      const { bucket, filename } = req.params;
      
      // Use PBLGIC02 bucket from object storage
      const objectStorageBucket = "PBLGIC02";
      
      // Object storage URL patterns (try multiple common patterns)
      // Note: Based on the redirect to login, this bucket likely requires authentication
      // Let's try public access patterns first
      const urlPatterns = [
        // Public Google Cloud Storage patterns
        `https://storage.googleapis.com/${objectStorageBucket}/${filename}`,
        `https://storage.cloud.google.com/${objectStorageBucket}/${filename}`,
        // Try with download parameter for public access
        `https://storage.googleapis.com/download/storage/v1/b/${objectStorageBucket}/o/${encodeURIComponent(filename)}?alt=media`,
        // Public bucket access
        `https://${objectStorageBucket}.storage.googleapis.com/${filename}`,
        // AWS S3 patterns (in case it's actually S3)
        `https://${objectStorageBucket}.s3.amazonaws.com/${filename}`,
        `https://s3.amazonaws.com/${objectStorageBucket}/${filename}`,
        // Alternative S3 patterns
        `https://${objectStorageBucket}.s3.us-east-1.amazonaws.com/${filename}`,
        `https://${objectStorageBucket}.s3.ap-northeast-2.amazonaws.com/${filename}`,
      ];
      
      let imageResponse = null;
      let lastError = null;
      
      // Try each URL pattern until one works
      for (const imageUrl of urlPatterns) {
        try {
          console.log(`Trying to fetch: ${imageUrl}`);
          const response = await fetch(imageUrl);
          console.log(`Response status: ${response.status}, Content-Type: ${response.headers.get('content-type')} for ${imageUrl}`);
          
          // Check if it's actually an image
          const contentType = response.headers.get('content-type');
          if (response.ok && contentType && contentType.startsWith('image/')) {
            imageResponse = response;
            console.log(`Successfully fetched image from: ${imageUrl}`);
            break;
          } else if (response.ok) {
            console.log(`Response was OK but not an image. Content-Type: ${contentType}`);
          } else {
            console.log(`HTTP ${response.status}: ${response.statusText} for ${imageUrl}`);
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
      
      // Set headers and send buffer
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.setHeader('Access-Control-Allow-Origin', '*');
      
      // Convert to buffer and send
      const arrayBuffer = await imageResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      console.log(`Serving image: ${filename}, size: ${buffer.length} bytes, type: ${contentType}`);
      console.log(`First few bytes: ${buffer.subarray(0, 8).toString('hex')}`);
      
      // Use res.end instead of res.send for binary data
      res.setHeader('Content-Length', buffer.length);
      res.end(buffer, 'binary');
      
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
