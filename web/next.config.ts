import type { NextConfig } from "next";

const chatBackend = process.env.CHAT_BACKEND_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  async rewrites() {
    // В проде /chat/* проксирует nginx; rewrites нужны для dev и docker-compose.
    return [{ source: "/chat/:path*", destination: `${chatBackend}/chat/:path*` }];
  },
};

export default nextConfig;
