import type { NextConfig } from "next";

const chatBackend = process.env.CHAT_BACKEND_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  async rewrites() {
    // В проде /chat/* проксирует nginx; rewrites нужны для dev и docker-compose.
    return [{ source: "/chat/:path*", destination: `${chatBackend}/chat/:path*` }];
  },
};

export default nextConfig;
