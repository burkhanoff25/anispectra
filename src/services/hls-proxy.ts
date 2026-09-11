import express, { Request, Response } from 'express';
import axios from 'axios';
import { URL } from 'url';

const hlsProxyRouter = express.Router();

hlsProxyRouter.get('/stream', async (req: Request, res: Response) => {
  const targetUrl = req.query.url as string;

  if (!targetUrl) {
    return res.status(400).send('Missing url parameter');
  }

  try {
    const response = await axios({
      method: 'GET',
      url: targetUrl,
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        // Add more headers if needed (e.g., Referer for bypass)
      }
    });

    const contentType = (response.headers['content-type'] as string) || 'application/vnd.apple.mpegurl';
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Content-Type', contentType);

    // If it's a playlist (.m3u8), we need to rewrite the URLs inside it
    if (contentType.includes('mpegurl') || targetUrl.includes('.m3u8')) {
      const targetUrlObj = new URL(targetUrl);
      const baseUrl = `${targetUrlObj.protocol}//${targetUrlObj.host}${targetUrlObj.pathname.substring(0, targetUrlObj.pathname.lastIndexOf('/'))}`;

      let manifestContent = '';

      response.data.on('data', (chunk: Buffer) => {
        manifestContent += chunk.toString();
      });

      response.data.on('end', () => {
        const rewrittenManifest = manifestContent.split('\n').map(line => {
          line = line.trim();
          if (line && !line.startsWith('#')) {
            // It's an URI (either segment or another playlist)
            let absoluteUrl = line;
            if (!line.startsWith('http')) {
              absoluteUrl = line.startsWith('/') 
                ? `${targetUrlObj.protocol}//${targetUrlObj.host}${line}`
                : `${baseUrl}/${line}`;
            }
            
            // Rewrite the URL to point to our proxy
            return `/api/proxy/stream?url=${encodeURIComponent(absoluteUrl)}`;
          }
          return line;
        }).join('\n');

        res.send(rewrittenManifest);
      });
    } else {
      // If it's a segment (.ts file) or video stream, pipe directly
      response.data.pipe(res);
    }
  } catch (error) {
    const err = error as Error & { response?: { status: number } };
    console.error(`[API_ERROR] operation=hlsProxy url=${targetUrl} status=${err.response?.status} error=${err.message}`);
    res.status(err.response?.status || 500).send('Error proxying the stream');
  }
});

export default hlsProxyRouter;
