export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/admin", "/teacher", "/api"],
    },
    sitemap: "https://lexiounderground.com.br/sitemap.xml",
  };
}
