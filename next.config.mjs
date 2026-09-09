/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Cloudflare Pages ne fournit pas l'optimiseur d'images Next (runtime Node).
    // Les URL Unsplash sont déjà dimensionnées, celles de Firebase Storage sont
    // servies telles quelles. `next/image` garde lazy-loading, ratio et `sizes`.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
