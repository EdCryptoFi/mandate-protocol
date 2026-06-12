import type { NextConfig } from "next";

const SECURITY_HEADERS = [
  // Previne clickjacking — a app não pode ser embutida em iframe
  { key: "X-Frame-Options", value: "DENY" },
  // Previne MIME sniffing que pode transformar texto em script executável
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Força HTTPS por 1 ano, incluindo subdomínios
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // Restringe origens de scripts, estilos e conexões
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' http://localhost:7575 ws://localhost:* https://unpkg.com https://cdn.jsdelivr.net",
      "worker-src blob:",
      "frame-ancestors 'none'",
    ].join("; "),
  },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // Desabilita source maps em produção — nunca expor código-fonte
  productionBrowserSourceMaps: false,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default nextConfig;
