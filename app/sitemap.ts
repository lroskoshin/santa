import { MetadataRoute } from "next";
import { locales, getLocalizedPath } from "@/lib/i18n";

const baseUrl = "https://wesanta.club";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["/", "/shuffle"];
  const lastModified = new Date();

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Generate entries for each locale
  for (const locale of locales) {
    for (const route of routes) {
      const localizedPath = getLocalizedPath(route, locale);
      sitemapEntries.push({
        url: `${baseUrl}${localizedPath}`,
        lastModified,
        changeFrequency: "daily",
        priority: route === "/" ? 1 : 0.8,
      });
    }
  }

  return sitemapEntries;
}
