export default async function sitemap() {
  return [
    {
      url: "https://lexiounderground.com.br/",
      lastModified: new Date().toISOString().split("T")[0],
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: "https://lexiounderground.com.br/auth/login",
      lastModified: new Date().toISOString().split("T")[0],
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://lexiounderground.com.br/dashboard",
      lastModified: new Date().toISOString().split("T")[0],
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: "https://lexiounderground.com.br/onboarding",
      lastModified: new Date().toISOString().split("T")[0],
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
