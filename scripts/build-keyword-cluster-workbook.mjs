import fs from 'node:fs/promises';
import path from 'node:path';
import { Workbook, SpreadsheetFile } from '@oai/artifact-tool';

const root = process.cwd();
const sourceCsv = path.join(root, 'output', 'full-site-keyword-map-2026-09-26.csv');
const outputDir = path.join(root, 'output', 'keyword-map-content-clusters-2026-09-26');
const outputFile = path.join(outputDir, 'Li-Men-keyword-map-and-content-clusters-2026-09-26.xlsx');

function parseCsv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field.replace(/\r$/, '')); rows.push(row); row = []; field = ''; }
    else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const headers = rows.shift();
  return rows.filter(r => r.some(Boolean)).map(r => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ''])));
}

const sourceRows = parseCsv(await fs.readFile(sourceCsv, 'utf8'));
const newRows = [
  {
    url: 'https://koigatetech.com/blog/how-to-evaluate-a-water-purifier-manufacturer', language: 'en', page_type: 'Blog article',
    intent: 'Commercial investigation', primary_keyword: 'how to evaluate a water purifier manufacturer',
    secondary_keywords: 'water purifier manufacturer checklist; OEM water purifier supplier evaluation; water purifier factory audit',
    topic_cluster: 'Manufacturer / OEM', recommended_action: 'Deployed 2026-09-26; use as the supplier-evaluation pillar and link to About, Certificates, Products and Contact.'
  },
  {
    url: 'https://koigatetech.com/es/blog/how-to-evaluate-a-water-purifier-manufacturer', language: 'es', page_type: 'Blog article',
    intent: 'Commercial investigation', primary_keyword: 'cómo evaluar a un fabricante de purificadores de agua',
    secondary_keywords: 'lista para evaluar proveedores; fabricante OEM de purificadores; auditoría de fábrica de purificadores',
    topic_cluster: 'Manufacturer / OEM', recommended_action: 'Publicado 2026-09-26; usar como pilar de evaluación y enlazar a Empresa, Certificados, Productos y Contacto.'
  }
];
for (const n of newRows) if (!sourceRows.some(r => r.url === n.url)) sourceRows.push(n);

function pillarFor(r) {
  const s = `${r.topic_cluster} ${r.url} ${r.primary_keyword}`.toLowerCase();
  if (s.includes('commercial')) return 'Commercial RO projects';
  if (s.includes('countertop') || s.includes('dispenser') || s.includes('instant hot')) return 'Countertop and dispensers';
  if (s.includes('ultrafiltration') || s.includes('pre-filter') || s.includes('pre filter')) return 'UF and whole-house pre-filters';
  if (s.includes('under-sink') || s.includes('under sink') || s.includes('100 gpd') || r.page_type === 'Product detail') return 'Under-sink RO systems';
  return 'Manufacturer, OEM and compliance';
}

function stageFor(type, intent) {
  if (type === 'Conversion') return 'Decision';
  if (type === 'Product detail') return 'Decision';
  if (type === 'Product category' || type === 'Product hub' || intent.includes('Commercial')) return 'Consideration';
  if (type === 'FAQ' || type === 'Blog article' || type === 'Blog hub') return 'Awareness / consideration';
  if (type === 'Evidence' || type === 'Company') return 'Consideration / decision';
  return 'Navigational';
}

function priorityFor(r) {
  if (['Homepage','Product hub','Product category','Company','Evidence','Conversion'].includes(r.page_type)) return 'P1';
  if (r.url.includes('how-to-evaluate-a-water-purifier-manufacturer')) return 'P1';
  if (r.page_type === 'Product detail') return r.url.includes('100-gpd') || pillarFor(r) === 'Commercial RO projects' ? 'P1' : 'P2';
  if (['Blog article','FAQ','Blog hub'].includes(r.page_type)) return 'P2';
  return 'No growth target';
}

function parentUrl(r, pillar) {
  const es = r.language === 'es' ? '/es' : '';
  if (pillar === 'Under-sink RO systems') return `https://koigatetech.com${es}/products/category/under-sink-ro-water-purifiers`;
  if (pillar === 'Countertop and dispensers') return `https://koigatetech.com${es}/products`;
  if (pillar === 'UF and whole-house pre-filters') return `https://koigatetech.com${es}/products`;
  if (pillar === 'Commercial RO projects') return `https://koigatetech.com${es}/products/category/commercial-ro-water-purification-systems`;
  return `https://koigatetech.com${es}/`;
}

const mapRows = sourceRows.map((r, i) => {
  const pillar = pillarFor(r);
  const isLiveArticle = r.url.includes('how-to-evaluate-a-water-purifier-manufacturer');
  return {
    id: i + 1,
    ...r,
    buyer_stage: stageFor(r.page_type, r.intent),
    pillar,
    priority: priorityFor(r),
    status: isLiveArticle ? 'Deployed 2026-09-26' : 'Existing live page',
    demand_evidence: (r.url.includes('100-gpd') ? 'GSC observed query: ro 100 (1 impression, supplied screenshot)' : 'Search volume and difficulty unknown'),
    parent_hub: parentUrl(r, pillar),
    link_out: r.page_type === 'Product detail' ? 'Parent category; related guide; Contact' : r.page_type === 'Blog article' ? 'One category; 2-4 relevant products; Certificates/About where relevant; Contact' : 'Relevant child pages and Contact',
    avoid_competing_with: r.page_type === 'Product detail' ? 'Category-level manufacturer/supplier terms' : r.page_type === 'Product category' ? 'Model/capacity-specific product queries' : r.page_type === 'Blog article' ? 'Exact product/model transactional queries' : 'More specific child-page queries',
  };
});

const clusters = [
  ['P1','Manufacturer, OEM and compliance','Pillar','Deployed','How to Evaluate a Water Purifier Manufacturer for an OEM or Distribution Project','how to evaluate a water purifier manufacturer','Commercial investigation','Consideration','/blog/how-to-evaluate-a-water-purifier-manufacturer','Homepage; About; Certificates; Products; Contact','Supplier qualification checklist with model and market caveats'],
  ['P1','Manufacturer, OEM and compliance','Spoke','Planned','OEM vs ODM vs Private Label Water Purifiers: Responsibilities and Buyer Checklist','OEM vs ODM water purifier','Commercial investigation','Consideration','/blog/oem-vs-odm-vs-private-label-water-purifiers','Evaluation pillar; FAQ; Contact','Define deliverables, approvals, packaging and change control'],
  ['P1','Manufacturer, OEM and compliance','Spoke','Planned','Water Purifier OEM Quote Checklist: What Buyers Should Send','OEM water purifier quote checklist','Transactional information','Decision','/blog/water-purifier-oem-quote-checklist','Evaluation pillar; Products; Contact','Downloadable/request checklist without invented MOQ or price'],
  ['P1','Manufacturer, OEM and compliance','Spoke','Planned','How to Verify Water Purifier Certificates for a Target Market','water purifier certification requirements','Supplier due diligence','Consideration / decision','/blog/how-to-verify-water-purifier-certificates','Certificates; evaluation pillar; Contact','Explain scope, named model, issuer, date and local review'],
  ['P2','Manufacturer, OEM and compliance','Spoke','Planned','Water Purifier Factory Audit Checklist for Overseas Buyers','water purifier factory audit checklist','Commercial investigation','Consideration','/blog/water-purifier-factory-audit-checklist','About; manufacturing-process post; evaluation pillar','Use only verifiable factory evidence'],
  ['P2','Manufacturer, OEM and compliance','Spoke','Planned','Water Purifier Sample Approval Checklist for Private-Label Projects','water purifier sample approval checklist','Implementation','Decision','/blog/water-purifier-sample-approval-checklist','OEM/ODM guide; Contact','Configuration, labels, manuals, packaging and sign-off'],
  ['P1','Under-sink RO systems','Pillar','Planned','Under-Sink RO Water Purifier Buyer Guide for Distributors','under sink RO water purifier wholesale','Commercial investigation','Consideration','/blog/under-sink-ro-water-purifier-buyer-guide','Under-sink category; selected models; Contact','Capacity, tank/tankless, controls, consumables and installation'],
  ['P1','Under-sink RO systems','Spoke','Planned','How to Select a 100 GPD RO Water Purifier for Distribution','100 GPD RO water purifier','Commercial investigation','Consideration','/blog/how-to-select-100-gpd-ro-water-purifier','M29; M30; under-sink category; Contact','Build on the observed GSC ro 100 query'],
  ['P1','Under-sink RO systems','Spoke','Planned','Tankless vs Tank RO Water Purifiers for Product-Line Planning','tankless vs tank RO water purifier','Comparison','Consideration','/blog/tankless-vs-tank-ro-water-purifiers','Under-sink guide; relevant models','Compare installation and product-positioning factors'],
  ['P2','Under-sink RO systems','Spoke','Planned','400 GPD vs 600 GPD RO Systems: What Buyers Should Compare','400 GPD vs 600 GPD RO system','Comparison','Consideration','/blog/400-gpd-vs-600-gpd-ro-systems','Capacity-matched models; under-sink guide','Avoid universal household-size claims'],
  ['P2','Under-sink RO systems','Spoke','Planned','RO Membrane Capacity Explained for B2B Water Purifier Buyers','RO membrane capacity explained','Informational','Awareness / consideration','/blog/ro-membrane-capacity-explained','Under-sink guide; commercial RO guide','Rated capacity versus operating conditions'],
  ['P2','Under-sink RO systems','Spoke','Planned','RO Water Purifier Filter-Stage Comparison and Consumables Checklist','RO filter stages comparison','Informational / commercial','Consideration','/blog/ro-filter-stages-and-consumables-checklist','Under-sink guide; selected models','Explain configurations without implying more stages always means better'],
  ['P1','Countertop and dispensers','Pillar','Planned','Countertop RO Water Purifier Sourcing Guide','countertop RO water purifier manufacturer','Commercial investigation','Consideration','/blog/countertop-ro-water-purifier-sourcing-guide','Countertop category; dispensers; Contact','Temperature, installation, tank and electrical requirements'],
  ['P1','Countertop and dispensers','Spoke','Planned','Instant Hot Water Dispenser Specification Checklist','instant hot water dispenser OEM','Commercial investigation','Consideration','/blog/instant-hot-water-dispenser-specification-checklist','Instant-hot category; countertop guide; Contact','Temperature settings, safety, power and market requirements'],
  ['P2','Countertop and dispensers','Spoke','Planned','Countertop vs Under-Sink RO Systems for Distributor Product Lines','countertop vs under sink RO system','Comparison','Consideration','/blog/countertop-vs-under-sink-ro-systems','Both pillar guides; Products','Channel and installation fit, not consumer medical claims'],
  ['P2','Countertop and dispensers','Spoke','Planned','Hot and Cold Water Dispenser Buying Checklist for Importers','hot and cold water dispenser wholesale','Commercial investigation','Consideration','/blog/hot-cold-water-dispenser-buying-checklist','Dispenser products; Contact','Outlets, cooling/heating, voltage and documentation'],
  ['P2','Countertop and dispensers','Spoke','Planned','Smart Display and Voice Control Options in Water Purifiers','smart water purifier OEM','Commercial investigation','Awareness / consideration','/blog/smart-water-purifier-display-voice-control','Relevant models; OEM guide','Standard versus optional functions'],
  ['P1','UF and whole-house pre-filters','Pillar','Planned','Ultrafiltration Water Purifier Guide for Distributors','ultrafiltration water purifier manufacturer','Commercial investigation','Consideration','/blog/ultrafiltration-water-purifier-distributor-guide','UF category; models; Contact','Membrane, flow, installation and replacement'],
  ['P1','UF and whole-house pre-filters','Spoke','Planned','RO vs UF Water Purifiers: A Distributor Selection Guide','RO vs UF water purifier','Comparison','Consideration','/blog/ro-vs-uf-water-purifiers','UF guide; under-sink RO guide; Products','Selection by source water, goals and local validation'],
  ['P1','UF and whole-house pre-filters','Pillar','Planned','Whole-House Pre-Filter Specification Checklist','whole house pre filter manufacturer','Commercial investigation','Consideration','/blog/whole-house-pre-filter-specification-checklist','Pre-filter category; products; Contact','Connection, flow, housing, flush method and installation'],
  ['P2','UF and whole-house pre-filters','Spoke','Planned','Backwash vs Manual-Flush Pre-Filters','backwash vs manual flush pre filter','Comparison','Consideration','/blog/backwash-vs-manual-flush-pre-filters','Pre-filter guide; matching models','Maintenance and project-fit comparison'],
  ['P2','UF and whole-house pre-filters','Spoke','Planned','15-Inch vs 20-Inch UF Water Purifiers','15 inch vs 20 inch UF water purifier','Comparison','Consideration','/blog/15-inch-vs-20-inch-uf-water-purifiers','UF guide; models','Use verified model dimensions and capacity'],
  ['P2','UF and whole-house pre-filters','Spoke','Planned','Whole-House Water Pre-Filter Installation Data Buyers Must Confirm','whole house pre filter installation requirements','Implementation','Decision','/blog/whole-house-pre-filter-installation-data','Pre-filter guide; Contact','Pipe, pressure, space, drainage and service access'],
  ['P1','Commercial RO projects','Pillar','Existing','Commercial RO System Specification Checklist','commercial RO system specification checklist','Commercial investigation','Decision','/blog/commercial-ro-system-specification-checklist-what-b2b-buyers-should-provide-before-requesting-a-quote','Commercial category; models; Contact','Expand and keep as commercial project pillar'],
  ['P1','Commercial RO projects','Spoke','Planned','How to Size a Commercial RO System: Inputs Buyers Must Provide','commercial RO system sizing inputs','Informational / commercial','Consideration','/blog/how-to-size-commercial-ro-system','Commercial checklist; Contact','Inputs and process, not an unsupported calculator'],
  ['P1','Commercial RO projects','Spoke','Planned','Commercial RO Pretreatment Checklist','commercial RO pretreatment requirements','Informational / commercial','Consideration','/blog/commercial-ro-pretreatment-checklist','Commercial pillar; products','Source-water analysis and component confirmation'],
  ['P2','Commercial RO projects','Spoke','Planned','800 GPD vs 1600 GPD Commercial RO Systems','800 GPD vs 1600 GPD RO system','Comparison','Consideration','/blog/800-gpd-vs-1600-gpd-commercial-ro','Commercial pillar; matching models','Rated range versus site conditions'],
  ['P2','Commercial RO projects','Spoke','Planned','Commercial Water Purifier Project Documentation Checklist','commercial water purifier project documents','Supplier due diligence','Decision','/blog/commercial-water-purifier-project-documents','Certificates; commercial pillar; Contact','Drawings, specifications, reports and approvals'],
  ['P2','Commercial RO projects','Spoke','Planned','Commercial RO Maintenance and Consumables Planning','commercial RO maintenance checklist','Implementation','Decision','/blog/commercial-ro-maintenance-consumables-planning','Commercial pillar; products','Service intervals must be confirmed per system and water'],
  ['P2','Manufacturer, OEM and compliance','Authority','Planned','Water Purifier Manufacturing and Procurement Statistics','water purifier industry statistics','Informational / link earning','Awareness','/blog/water-purifier-manufacturing-procurement-statistics','All pillars where relevant','Only sourceable current statistics; update at least annually'],
];

const workbook = Workbook.create();
const overview = workbook.worksheets.add('Overview');
const mapSheet = workbook.worksheets.add('Keyword Map');
const clusterSheet = workbook.worksheets.add('Content Clusters');
const linkSheet = workbook.worksheets.add('Internal Links');
const methodSheet = workbook.worksheets.add('Method');
for (const s of workbook.worksheets.items) s.showGridLines = false;

const font = 'Arial';
const navy = '#17324D', blue = '#2D6CDF', lightBlue = '#EAF2FF', green = '#DDF3E6', amber = '#FFF1CC', gray = '#F3F5F7', red = '#FCE8E6';
function title(sheet, text, width) {
  sheet.getRange(`A2:${width}2`).merge();
  sheet.getRange('A2').values = [[text]];
  sheet.getRange('A2').format = { font: { name: font, size: 15, bold: true, color: navy }, verticalAlignment: 'center' };
  sheet.getRange(`A3:${width}3`).format.borders = { bottom: { style: 'thin', color: '#9AA7B2' } };
}
function header(range) {
  range.format = { fill: navy, font: { name: font, size: 10, bold: true, color: '#FFFFFF' }, horizontalAlignment: 'center', verticalAlignment: 'center', wrapText: true, borders: { insideVertical: { style: 'thin', color: '#FFFFFF' } } };
}
function body(range) {
  range.format.font = { name: font, size: 10, color: '#263238' };
  range.format.verticalAlignment = 'top';
}

title(overview, 'Li-Men keyword map and content cluster plan', 'H');
overview.getRange('A5:B10').values = [
  ['Metric','Value'], ['Mapped live URLs', mapRows.length], ['English URLs', mapRows.filter(r=>r.language==='en').length], ['Spanish URLs', mapRows.filter(r=>r.language==='es').length], ['Planned/deployed cluster topics', clusters.length], ['Planning date','2026-09-26']
];
header(overview.getRange('A5:B5')); body(overview.getRange('A6:B10'));
overview.getRange('D5:H11').values = [
  ['Priority','Focus','Outcome','Sequence','Measurement'],
  ['1','Manufacturer/OEM authority','Qualified supplier-evaluation demand','Keep deployed pillar; add OEM/ODM, quote and certificate spokes','GSC impressions, query diversity, assisted inquiries'],
  ['2','100 GPD and under-sink RO','Expand the only observed query into a product cluster','Publish 100 GPD guide, tank comparison, capacity and consumables pieces','Queries and landing pages for 100 GPD / under-sink terms'],
  ['3','Commercial RO','Capture specification-led project demand','Strengthen existing checklist; add sizing, pretreatment and documents','Qualified commercial project inquiries'],
  ['4','Countertop/dispenser','Create category-level buying guidance','Publish one pillar before feature-specific spokes','Category impressions and product clicks'],
  ['5','UF/pre-filter','Cover comparison and installation tasks','Publish RO vs UF and pre-filter checklist first','New non-RO query families'],
  ['Guardrail','No one-page-per-variant publishing','Consolidate close variants by shared intent','One page owns one buyer task; products own model terms','Monitor cannibalization by query and page']
];
header(overview.getRange('D5:H5')); body(overview.getRange('D6:H11'));
overview.getRange('A13:H17').values = [
  ['Phase','Timing','Pieces','Primary objective','Prerequisite','Do not change together','Review rule','Status'],
  ['Phase 1','Weeks 1-4','6','Manufacturer/OEM + 100 GPD','SME fact check and internal links','URLs and page templates','Check indexability and early query coverage after publishing','Start'],
  ['Phase 2','Weeks 5-8','8','Under-sink + commercial RO','Phase 1 quality review','Multiple overlapping capacity pages','Continue if pages are indexed and distinct by intent','Planned'],
  ['Phase 3','Weeks 9-12','8','Countertop + UF/pre-filter','Category/product evidence','Unverified technical claims','Continue if qualified impressions broaden','Planned'],
  ['Ongoing','Quarterly','Refresh','Evidence, stats and winning pages','GSC + inquiry feedback','Date-only freshness updates','Refresh when facts, products or query intent change','Planned']
];
header(overview.getRange('A13:H13')); body(overview.getRange('A14:H17'));
overview.getRange('A19:H21').values = [
  ['Evidence note','','','','','','',''],
  ['Known','GSC screenshot supplied by user shows “ro 100” with 1 impression. The deployed manufacturer-evaluation article and M29/M30 metadata were verified live on 2026-09-26.','','','','','',''],
  ['Unknown','Search volume, keyword difficulty, competitor overlap and conversions are not available. Priorities therefore use business fit, page role and observed site/GSC evidence—not invented metrics.','','','','','','']
];
overview.getRange('A19:H19').format = { fill: lightBlue, font: { name: font, bold: true, color: navy } };
overview.getRange('A20:H21').format.font = { name: font, size: 10, color: '#263238' };
overview.getRange('B20:H20').merge(); overview.getRange('B21:H21').merge();

const mapHeaders = ['ID','URL','Language','Page type','Intent','Buyer stage','Primary keyword','Secondary keywords','Pillar','Priority','Status','Demand evidence','Parent hub','Link out','Avoid competing with','Recommended action'];
const mapValues = mapRows.map(r => [r.id,r.url,r.language,r.page_type,r.intent,r.buyer_stage,r.primary_keyword,r.secondary_keywords,r.pillar,r.priority,r.status,r.demand_evidence,r.parent_hub,r.link_out,r.avoid_competing_with,r.recommended_action]);
title(mapSheet, 'Full-site keyword-to-page map (146 live URLs)', 'P');
mapSheet.getRange('A4:P4').values = [mapHeaders];
mapSheet.getRangeByIndexes(4,0,mapValues.length,mapHeaders.length).values = mapValues;
header(mapSheet.getRange('A4:P4')); body(mapSheet.getRange(`A5:P${mapValues.length+4}`));
mapSheet.tables.add(`A4:P${mapValues.length+4}`, true, 'KeywordMapTable').style = 'TableStyleMedium2';
mapSheet.freezePanes.freezeRows(4); mapSheet.freezePanes.freezeColumns(2);

const clusterHeaders = ['Priority','Pillar','Role','Status','Working title','Primary keyword','Intent','Buyer stage','Proposed URL','Internal links','Unique value / evidence requirement'];
title(clusterSheet, 'Content cluster roadmap', 'K');
clusterSheet.getRange('A4:K4').values = [clusterHeaders];
clusterSheet.getRangeByIndexes(4,0,clusters.length,clusterHeaders.length).values = clusters;
header(clusterSheet.getRange('A4:K4')); body(clusterSheet.getRange(`A5:K${clusters.length+4}`));
clusterSheet.tables.add(`A4:K${clusters.length+4}`, true, 'ContentClusterTable').style = 'TableStyleMedium2';
clusterSheet.freezePanes.freezeRows(4); clusterSheet.freezePanes.freezeColumns(2);
clusterSheet.getRange(`A5:A${clusters.length+4}`).conditionalFormats.add('containsText',{text:'P1',format:{fill:amber,font:{bold:true,color:'#7A4B00'}}});
clusterSheet.getRange(`D5:D${clusters.length+4}`).conditionalFormats.add('containsText',{text:'Deployed',format:{fill:green,font:{bold:true,color:'#176B3A'}}});

const links = [
  ['Manufacturer, OEM and compliance','Homepage','Evaluation pillar; About; Certificates; FAQ; Contact','Spokes link back to evaluation pillar and one evidence/conversion page','Avoid repeating generic manufacturer copy on every product'],
  ['Under-sink RO systems','Under-sink RO category','100 GPD guide; tankless vs tank; capacity; filter stages','Guides link to category plus only the relevant models','Product pages own model/capacity combinations; guide owns selection task'],
  ['Countertop and dispensers','Countertop / instant-hot categories','Sourcing guide; specification checklist; feature guides','Feature spokes link to sourcing pillar and matching products','Do not create a page for every feature synonym'],
  ['UF and whole-house pre-filters','UF and pre-filter categories','UF guide; RO vs UF; pre-filter checklist; installation','Comparison pages link to both category hubs','Split only when product type or buyer task differs'],
  ['Commercial RO projects','Commercial RO category + existing specification checklist','Sizing; pretreatment; capacity comparison; documents; maintenance','Every spoke links to the commercial checklist and Contact','Avoid unsupported performance and universal sizing claims'],
];
title(linkSheet, 'Internal-link architecture and cannibalization guardrails', 'E');
linkSheet.getRange('A4:E4').values = [['Pillar','Hub','Spokes','Required link pattern','Cannibalization guardrail']];
linkSheet.getRange('A5:E9').values = links;
header(linkSheet.getRange('A4:E4')); body(linkSheet.getRange('A5:E9'));
linkSheet.getRange('A12:E17').values = [
  ['Page role','Owns','Must link to','Must not target','Primary conversion'],
  ['Homepage','Manufacturer/OEM entity topic','Products; About; Certificates; flagship guide; Contact','Individual model keywords','Qualified inquiry'],
  ['Category','Category-level manufacturer/supplier/wholesale intent','Child products; one pillar guide; Contact','Specific model queries','Category shortlist / inquiry'],
  ['Product','Model, capacity, configuration and feature combination','Parent category; relevant guide; Contact','Broad manufacturer or category terms','Model inquiry'],
  ['Guide / pillar','One buyer task and its question family','Relevant categories, products, evidence and Contact','Exact model transactional terms','Assisted inquiry'],
  ['Evidence page','Factory/document proof and scope','Relevant guide and Contact','Product selection terms','Supplier qualification']
];
header(linkSheet.getRange('A12:E12')); body(linkSheet.getRange('A13:E17'));

title(methodSheet, 'Method, evidence and refresh rules', 'F');
methodSheet.getRange('A5:F13').values = [
  ['Item','Decision','Source / evidence','As of','Limitation','Refresh'],
  ['Business and audience','Overseas distributors, importers, private-label brands and commercial project buyers','Repository .agents/product-marketing.md','2026-09-10','Customer calls and CRM data not supplied','When positioning changes'],
  ['Live URL inventory','146 indexable sitemap URLs after deployment','https://koigatetech.com/sitemap.xml and prior 144-URL crawl','2026-09-26','Sitemap presence does not guarantee indexing','After publish/delete/redirect'],
  ['Query evidence','ro 100: 1 impression','User-provided GSC screenshot','2026-09-26','GSC low-volume/anonymized queries may be omitted','Every 28 days'],
  ['Keyword volumes','Unknown','No Keyword Planner/Ahrefs/Semrush export supplied','2026-09-26','No volume or difficulty claims made','When export is available'],
  ['Clustering','Shared buyer intent and expected page role; semantic similarity second','Qiaomu keyword-content method','2026-09-26','Current SERP overlap not collected for every term','Validate P1 topics before drafting'],
  ['Spanish plan','Localized topic intent, not literal keyword translation','Existing bilingual site structure and Spanish pages','2026-09-26','Spanish-market search demand not independently measured','Run separate Spanish discovery'],
  ['Success','Query diversity, qualified impressions, indexed landing pages and inquiries','GSC plus inquiry records','Future','Exposure and indexing are not guaranteed','7/28/90-day reviews'],
  ['Guardrail','No unsupported claims, doorway pages or one-page-per-variant publishing','SEO/content strategy rules','2026-09-26','Requires subject-matter review','Every content batch']
];
header(methodSheet.getRange('A5:F5')); body(methodSheet.getRange('A6:F13'));

for (const sheet of [overview,mapSheet,clusterSheet,linkSheet,methodSheet]) {
  const used = sheet.getUsedRange();
  used.format.font = { ...used.format.font, name: font };
  used.format.wrapText = true;
  used.format.verticalAlignment = 'top';
}
overview.getRange('A1:H25').format.columnWidth = 18;
overview.getRange('A:A').format.columnWidth = 16; overview.getRange('B:B').format.columnWidth = 28;
overview.getRange('D:H').format.columnWidth = 24;
mapSheet.getRange('A:A').format.columnWidth = 7; mapSheet.getRange('B:B').format.columnWidth = 52; mapSheet.getRange('C:C').format.columnWidth = 10;
mapSheet.getRange('D:F').format.columnWidth = 22; mapSheet.getRange('G:H').format.columnWidth = 36; mapSheet.getRange('I:P').format.columnWidth = 28;
clusterSheet.getRange('A:D').format.columnWidth = 18; clusterSheet.getRange('E:E').format.columnWidth = 52; clusterSheet.getRange('F:K').format.columnWidth = 30;
linkSheet.getRange('A:E').format.columnWidth = 34;
methodSheet.getRange('A:F').format.columnWidth = 30;
for (const sheet of [overview,mapSheet,clusterSheet,linkSheet,methodSheet]) sheet.getUsedRange().format.autofitRows();
overview.tabColor = navy; clusterSheet.tabColor = blue; mapSheet.tabColor = '#5B8DEF'; methodSheet.tabColor = '#8A98A8';

workbook.recalculate();
await fs.mkdir(outputDir, { recursive: true });
const preview1 = await workbook.render({ sheetName: 'Overview', range: 'A1:H21', scale: 1.2, format: 'png' });
await fs.writeFile(path.join(outputDir, 'preview-overview.png'), new Uint8Array(await preview1.arrayBuffer()));
const preview2 = await workbook.render({ sheetName: 'Content Clusters', range: 'A1:K18', scale: 1.0, format: 'png' });
await fs.writeFile(path.join(outputDir, 'preview-content-clusters.png'), new Uint8Array(await preview2.arrayBuffer()));
const out = await SpreadsheetFile.exportXlsx(workbook);
await out.save(outputFile);

const inspectOverview = await workbook.inspect({kind:'table',range:'Overview!A5:H21',include:'values,formulas',tableMaxRows:20,tableMaxCols:10,maxChars:10000});
const inspectClusters = await workbook.inspect({kind:'table',range:'Content Clusters!A4:K12',include:'values,formulas',tableMaxRows:12,tableMaxCols:12,maxChars:10000});
const errors = await workbook.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:100},summary:'final formula error scan'});
console.log(JSON.stringify({outputFile,mapRows:mapRows.length,clusters:clusters.length,overview:inspectOverview.ndjson,clusterSample:inspectClusters.ndjson,errors:errors.ndjson},null,2));
