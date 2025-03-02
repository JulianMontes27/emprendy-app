import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ratelimit } from "./lib/limiter";
// import { apiRateLimitMiddleware } from "./lib/api-rate-limit";

//Rate limiting is a technique for controlling network traffic. It sets a limit on how many requests a client can make to a server in a specific period.
// export async function middleware(
//   request: NextRequest
// ): Promise<NextResponse | undefined> {
//   // rate limiting
//   const ip = request.ip ?? "127.0.0.1";
//   const { success } = await ratelimit.limit(ip); //if the same ip address makes more than 4 requests in 1 second...

//   return success
//     ? NextResponse.next()
//     : NextResponse.redirect(new URL("/blocked", request.url));
// }
export async function middleware() {}

export const config = {
  matcher: [
    // match all routes except static files and APIs
    // "/((?!api|_next/static|_next/image|favicon.ico).*)",
    "/api/:path*",
  ],
};
// Yes, you're absolutely right! When you request a page on your Next.js website, which might have middleware running on the edge and static cached assets, the data packets associated with that request can indeed take different routes through the internet before arriving at your browser.

// Here’s a breakdown of how it works in a Next.js context with middleware and edge caching:

// 1. Requesting a Page:
// When you request a page (e.g., yourwebsite.com/page), several components might be involved:

// Middleware on the Edge: If you have middleware running on the edge, it intercepts the request before it hits the main server. Edge servers are located close to the user geographically, so they can process the request faster.
// Static Cached Assets: If your static assets (like images, CSS, JavaScript files) are cached by a CDN (Content Delivery Network), the request for those assets might be fulfilled by a nearby edge server, reducing the need to go all the way back to the origin server.
// 2. Data Packets Travel via Different Routes:
// Once the request is sent, the various elements involved (HTML, CSS, JS, API responses, etc.) are split into data packets. These packets might:

// Take different routes through the internet, based on the most efficient path available at the time.
// Pass through routers and network nodes located in various parts of the world.
// Even though the packets take different paths, they have instructions (header data) that ensure they all arrive at the same destination (your browser) and are reassembled in the correct order.

// 3. Middleware on the Edge:
// Edge middleware runs on servers close to the user. When you make a request, it might:
// Handle authentication, custom routing, or content modifications before the request reaches the origin server.
// Serve content faster by doing things like early redirects or transformations.
// The response from the edge server will still go through the internet as data packets to your browser.
// 4. Static Cached Assets:
// If you have static assets (like images, CSS, and JS) cached in a CDN, those assets may not even need to travel to the origin server. The CDN might serve them directly from a local server close to you.
// These cached assets will still be broken into packets, but since they are stored at different CDN nodes, the packets may come from various geographical locations.
// 5. Reassembling in the Browser:
// Once all the data packets arrive at your browser:

// TCP/IP: The browser reassembles the packets in the correct order, thanks to TCP (Transmission Control Protocol), which ensures the integrity and order of the packets.
// HTTP/HTTPS: The browser uses HTTP or HTTPS protocols to interpret the content (HTML, CSS, JS, etc.) and render the webpage.
// Example Flow:
// Let’s say you request a page on yourwebsite.com, which has middleware running on the edge and uses a CDN for static assets like images and CSS files.

// Request Sent: You request yourwebsite.com/page.
// Middleware on the Edge:
// Your request first hits a nearby edge server (running middleware).
// Middleware may modify or handle the request (e.g., authentication or routing).
// The edge server sends its response (if any) as data packets.
// CDN Cached Assets:
// The CSS and image files requested by your browser are retrieved from a nearby CDN node, also sent as data packets.
// Packets Take Different Routes:
// The HTML response from the middleware might take one path through the internet.
// CSS and image packets from the CDN might take a different route.
// Reassembling in the Browser:
// All the packets arrive at your browser, which reassembles and renders them, resulting in the complete webpage.
// In summary, yes, the data packets from different components (middleware, static assets) can travel along different routes across the internet before arriving at your browser and being reassembled into a coherent webpage. This ensures fast and efficient content delivery, especially with the use of edge networks and CDNs.
