/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    // Medi Lexi moved from the site root to /medical (the community workspace now
    // owns the root). Permanently redirect the old product paths so existing
    // links and indexed URLs land on the new location. `:path*` matches zero or
    // more segments, so each rule also covers its bare path (e.g. /glossary).
    const paths = [
      '/glossary/:path*',
      '/wordparts/:path*',
      '/flashcards/:path*',
      '/term/:path*',
      '/terms',
      '/about',
      '/privacy',
    ]
    return paths.map((source) => ({
      source,
      destination: `/medical${source}`,
      permanent: true,
    }))
  },
}

export default nextConfig
