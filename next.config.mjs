/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Cloudflare Pages ne fournit pas l'optimiseur d'images Next (runtime Node).
    // Les URL Unsplash/Supabase sont déjà dimensionnées (?w=…). `next/image`
    // conserve lazy-loading, ratio et `sizes`.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
