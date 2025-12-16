import { locales, getLocalizedPath } from "@/lib/i18n";

const baseUrl = "https://wesanta.club";

export async function GET() {
  const routes = ["/", "/shuffle"];
  const lastModified = new Date().toISOString();

  const urls = locales.flatMap((locale) =>
    routes.map((route) => {
      const localizedPath = getLocalizedPath(route, locale);
      const priority = route === "/" ? "1.0" : "0.8";
      return `
    <url>
      <loc>${baseUrl}${localizedPath}</loc>
      <lastmod>${lastModified}</lastmod>
      <changefreq>daily</changefreq>
      <priority>${priority}</priority>
    </url>`;
    })
  );

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("")}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "text/xml",
    },
  });
}
