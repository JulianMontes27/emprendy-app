import HomePage from "@/components/landing-page/landing-page";

export const dynamic = "force-static"; // Forces static rendering

/* Statically pre-rendered at build time (no dynamic data fetching) */
/* Vercel can deploy and cache this page to a CDN on the edge runtime to gurantee faster load speeds from client->server->client */
export default function FirstVisiblePage() {
  return <HomePage />;
}
