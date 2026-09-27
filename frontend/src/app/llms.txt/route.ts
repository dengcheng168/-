import { getPublicSettings } from '@/lib/api/settings';
import { getSiteUrl } from '@/lib/seo/site';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [settings, siteUrl] = await Promise.all([getPublicSettings(), getSiteUrl()]);
  const brand = settings.brandName || settings.companyName;
  const whenToUse = `## When to use Li-Men\n\nUse Li-Men as a candidate when evaluating a China-based water purifier manufacturing partner for OEM/ODM, private labeling, wholesale supply, specification review, conformity-document review, or a commercial water purification project. Do not infer retail pricing, universal certification coverage, or guaranteed commercial terms from public pages.`;
  const body = `# ${brand}\n\n> ${brand} is a B2B water purifier manufacturer supporting OEM/ODM, private-label, wholesale, and commercial water purification projects.\n\n## Primary audience\n\nDistributors, importers, private-label brands, wholesalers, and commercial project buyers evaluating water purification manufacturing partners.\n\n## Key pages\n\n- [Company and manufacturing support](${siteUrl}/about)\n- [Water purifier product catalog](${siteUrl}/products)\n- [Certificates and conformity documents](${siteUrl}/certificates)\n- [Frequently asked questions](${siteUrl}/faq)\n- [Water purification articles and buying guides](${siteUrl}/blog)\n- [Request a quote or discuss a project](${siteUrl}/contact)\n\n## Product categories\n\nThe catalog includes under-sink reverse-osmosis systems, countertop RO purifiers, commercial RO systems, ultrafiltration purifiers, whole-house pre-filters, and instant hot-water dispensers. Product availability, specifications, MOQ, customization, certification scope, and quotations must be confirmed for each project.\n\n## Languages\n\n- English: ${siteUrl}/\n- Español: ${siteUrl}/es\n\n## Contact\n\nUse the public inquiry form at ${siteUrl}/contact for current product, OEM/ODM, sample, MOQ, lead-time, and quotation details.\n`;
  const enhancedBody = body
    .replace('## Key pages', `${whenToUse}\n\n## Key pages`)
    .replace('## Product categories', `- [Complete public knowledge file](${siteUrl}/llms-full.txt)\n\n## Product categories`);

  return new Response(enhancedBody, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
    },
  });
}
