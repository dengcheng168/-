import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const input = path.join(root, "docs", "research", "live-site-crawl-20260901.json");
const output = path.join(root, "output", "full-site-keyword-map-2026-09-26.csv");
const crawl = JSON.parse(fs.readFileSync(input, "utf8"));

const cleanTitle = (title) =>
  title
    .replace(/\s*\|\s*Li-Men\s*$/i, "")
    .replace(/\s*\|\s*OEM\s*$/i, "")
    .trim();

const humanize = (value) =>
  value
    .replace(/-/g, " ")
    .replace(/\bro\b/gi, "RO")
    .replace(/\buf\b/gi, "UF")
    .replace(/\boem\b/gi, "OEM")
    .replace(/\bodm\b/gi, "ODM");

function classify(page) {
  const url = new URL(page.url);
  const p = url.pathname.replace(/\/$/, "") || "/";
  const es = p === "/es" || p.startsWith("/es/");
  const local = es ? p.replace(/^\/es/, "") || "/" : p;
  const segments = local.split("/").filter(Boolean);
  const title = cleanTitle(page.title);

  if (local === "/") {
    return {
      type: "Homepage",
      intent: "Commercial / navigational",
      primary: es ? "fabricante de purificadores de agua OEM" : "water purifier manufacturer",
      secondary: es
        ? "fábrica de purificadores de agua; proveedor OEM ODM; purificadores de agua al por mayor"
        : "OEM water purifier manufacturer; ODM water purification supplier; wholesale water purifier factory",
      cluster: "Manufacturer / OEM",
      action: "Keep as the manufacturer entity and portfolio hub; do not target individual model terms.",
    };
  }

  if (local === "/products") {
    return {
      type: "Product hub",
      intent: "Commercial investigation",
      primary: es ? "catálogo de purificadores de agua al por mayor" : "wholesale water purifier catalog",
      secondary: es
        ? "sistemas RO; purificadores UF; proveedor de purificadores de agua"
        : "RO water purifiers; UF water purifiers; water purifier supplier",
      cluster: "Product portfolio",
      action: "Use as the portfolio hub and route demand to product categories.",
    };
  }

  if (segments[0] === "products" && segments[1] === "category") {
    const category = humanize(segments.at(-1));
    return {
      type: "Product category",
      intent: "Commercial investigation",
      primary: es ? `${category} fabricante` : `${category} manufacturer`,
      secondary: es
        ? `${category} proveedor; ${category} al por mayor; ${category} OEM`
        : `${category} supplier; wholesale ${category}; OEM ${category}`,
      cluster: `Category: ${category}`,
      action: "Own the category-level manufacturer/supplier intent; link to distinct models.",
    };
  }

  if (segments[0] === "products" && segments.length === 2) {
    const product = title;
    return {
      type: "Product detail",
      intent: "Transactional / product evaluation",
      primary: product,
      secondary: es
        ? `${product} fabricante; ${product} OEM; ${product} proveedor`
        : `${product} manufacturer; ${product} OEM; ${product} supplier`,
      cluster: title.toLowerCase().includes("commercial")
        ? "Commercial RO systems"
        : title.toLowerCase().includes("ultrafiltration")
          ? "Ultrafiltration systems"
          : title.toLowerCase().includes("pre-filter")
            ? "Whole-house pre-filters"
            : title.toLowerCase().includes("countertop") || title.toLowerCase().includes("dispenser")
              ? "Countertop / dispensers"
              : "Under-sink RO systems",
      action: "Keep model-specific; emphasize verified capacity, configuration, use case and inquiry data.",
    };
  }

  if (local === "/about") {
    return {
      type: "Company",
      intent: "Supplier due diligence",
      primary: es ? "fábrica de purificadores de agua en China" : "water purifier factory China",
      secondary: es
        ? "fabricante OEM ODM; capacidad de fabricación; proveedor de purificadores"
        : "OEM ODM manufacturer; water purifier manufacturing capability; supplier evaluation",
      cluster: "Manufacturer / OEM",
      action: "Support entity trust, manufacturing capability and supplier-evaluation intent.",
    };
  }

  if (local === "/certificates") {
    return {
      type: "Evidence",
      intent: "Supplier due diligence",
      primary: es ? "certificados de purificadores de agua" : "water purifier certificates",
      secondary: es
        ? "documentos de conformidad; alcance de certificación; documentación para compradores"
        : "water purifier compliance documents; certification scope; supplier documentation",
      cluster: "Compliance / documentation",
      action: "Explain document scope without claiming universal market approval.",
    };
  }

  if (local === "/contact") {
    return {
      type: "Conversion",
      intent: "Transactional",
      primary: es ? "solicitar cotización de purificador de agua OEM" : "request OEM water purifier quote",
      secondary: es
        ? "consulta de proyecto; cotización al por mayor; contacto fabricante"
        : "water purifier project inquiry; wholesale quotation; contact manufacturer",
      cluster: "Conversion",
      action: "Capture quote and project-inquiry intent; avoid informational keyword targeting.",
    };
  }

  if (local === "/faq") {
    return {
      type: "FAQ",
      intent: "Information / objection handling",
      primary: es ? "preguntas sobre purificadores de agua OEM" : "OEM water purifier FAQ",
      secondary: es
        ? "MOQ; personalización; muestras; plazo de entrega; documentos"
        : "MOQ; customization; samples; lead time; certification documents",
      cluster: "Manufacturer / OEM",
      action: "Answer verified procurement questions and link to relevant evidence and contact paths.",
    };
  }

  if (segments[0] === "blog" && segments.length === 2) {
    return {
      type: "Blog article",
      intent: "Informational / commercial investigation",
      primary: title,
      secondary: `${title}; ${es ? "guía para compradores; proveedor; fabricante" : "B2B buyer guide; supplier evaluation; manufacturer"}`,
      cluster: title.toLowerCase().includes("commercial")
        ? "Commercial RO systems"
        : title.toLowerCase().includes("manufactur") || title.toLowerCase().includes("factory")
          ? "Manufacturer / OEM"
          : "Company / market evidence",
      action: "Answer one buyer task, cite verifiable evidence and link to one category plus conversion page.",
    };
  }

  if (local === "/blog") {
    return {
      type: "Blog hub",
      intent: "Information discovery",
      primary: es ? "guías de compra de purificadores de agua" : "water purifier buyer guides",
      secondary: es ? "guías OEM; selección de productos; sistemas RO" : "OEM guides; product selection; RO system guides",
      cluster: "Editorial hub",
      action: "Organize all buyer-education clusters; do not compete with product pages.",
    };
  }

  const label = title || humanize(segments.at(-1) || "page");
  return {
    type: "Utility / policy",
    intent: "Navigational",
    primary: label,
    secondary: "",
    cluster: "Utility",
    action: "Keep accurate and indexable where appropriate; not a keyword-growth priority.",
  };
}

const csvEscape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
const headers = ["url", "language", "page_type", "intent", "primary_keyword", "secondary_keywords", "topic_cluster", "recommended_action"];
const rows = crawl.pages.map((page) => {
  const mapped = classify(page);
  return [
    page.url,
    page.lang || (page.url.includes("/es") ? "es" : "en"),
    mapped.type,
    mapped.intent,
    mapped.primary,
    mapped.secondary,
    mapped.cluster,
    mapped.action,
  ];
});

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n") + "\n", "utf8");
console.log(`WROTE ${output} (${rows.length} URLs)`);
