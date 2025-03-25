// test/cloudflare.js
import { PubFlow } from '../dist/index.mjs';

export default {
  async fetch(request, env, ctx) {
    // Create a PubFlow client
    const client = new PubFlow({
      baseUrl: 'https://api.example.com',
      debug: true
    });
    
    // Prepare response data
    const results = [];
    
    // Log the detected runtime
    results.push(`Detected runtime: ${client.runtime}`);
    
    // Test storage
    try {
      await client.auth.getSession();
      results.push('Storage test passed');
    } catch (error) {
      results.push(`Storage test failed: ${error.message}`);
    }
    
    // Test HTTP client
    try {
      // This will fail but we're just testing that the HTTP client works
      await client.auth.validateSession();
    } catch (error) {
      results.push(`HTTP client test completed (expected error): ${error.message}`);
    }
    
    // Return results as HTML
    return new Response(
      `<html>
        <head>
          <title>PubFlow Cloudflare Workers Test</title>
          <style>
            body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
            h1 { color: #333; }
            pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; }
          </style>
        </head>
        <body>
          <h1>PubFlow Cloudflare Workers Test Results</h1>
          <pre>${results.join('\n')}</pre>
        </body>
      </html>`,
      {
        headers: { 'Content-Type': 'text/html' },
      }
    );
  }
}