import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Vercel 서버리스 함수를 위한 핸들러
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { pathname } = new URL(req.url || '', `https://${req.headers.host}`);
    
    console.log('Request path:', pathname);
    console.log('Environment variables check:', {
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL ? 'SET' : 'MISSING',
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING'
    });

    // Test endpoint
    if (pathname === '/api/test') {
      return res.json({
        message: "API is working",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        supabaseUrl: process.env.VITE_SUPABASE_URL ? 'SET' : 'MISSING',
        supabaseKey: process.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING'
      });
    }

    // Image proxy endpoint
    if (pathname.startsWith('/api/images/')) {
      const pathParts = pathname.split('/');
      if (pathParts.length >= 5) {
        const bucket = pathParts[3];
        const filename = pathParts.slice(4).join('/');
        
        console.log('Image request:', { bucket, filename });
        
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
        
        try {
          const response = await fetch(imageUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; Vercel-Image-Proxy/1.0)'
            }
          });
          
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
          console.error('Error fetching image from Supabase:', fetchError);
          res.status(500).json({ 
            error: "Failed to fetch image from Supabase",
            details: fetchError.message
          });
        }
      } else {
        return res.status(400).json({ error: "Invalid image path" });
      }
    }

    // Default response for other paths
    res.status(404).json({ error: "Not found" });
    
  } catch (error: any) {
    console.error('Handler error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
}
