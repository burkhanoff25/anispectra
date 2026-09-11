import { chromium, Page } from 'playwright';

export interface DetectStreamResult {
  m3u8Url: string | null;
  error?: string;
}

export async function detectHlsStream(pageUrl: string): Promise<DetectStreamResult> {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
    });
    const page: Page = await context.newPage();
    let m3u8Url: string | null = null;

    // Intercept network requests
    page.on('response', (response) => {
      const url = response.url();
      const contentType = response.headers()['content-type'] || '';

      // Check if the response is an HLS playlist
      if (
        url.includes('.m3u8') ||
        contentType.includes('application/vnd.apple.mpegurl') ||
        contentType.includes('application/x-mpegURL')
      ) {
        // We only want the first or the master playlist usually
        if (!m3u8Url) {
          m3u8Url = url;
        }
      }
    });

    // Go to the target page and wait for network idle to ensure all scripts loaded
    await page.goto(pageUrl, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait an additional couple of seconds in case of delayed player initializations
    await page.waitForTimeout(3000);

    return { m3u8Url };
  } catch (error) {
    const err = error as Error;
    console.error(`[STREAM_DETECTOR] Failed to extract from ${pageUrl}: ${err.message}`);
    return { m3u8Url: null, error: err.message };
  } finally {
    await browser.close();
  }
}
