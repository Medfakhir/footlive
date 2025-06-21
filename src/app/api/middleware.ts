import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware enables CORS for API routes
export function middleware(request: NextRequest) {
  // Get the origin from the request headers
  const origin = request.headers.get('origin') || '*';
  
  // Get the response
  const response = NextResponse.next();
  
  // Add CORS headers to the response
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
  
  return response;
}

// Only apply this middleware to API routes
export const config = {
  matcher: '/api/:path*',
};