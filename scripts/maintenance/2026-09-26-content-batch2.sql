BEGIN IMMEDIATE;

INSERT INTO blog_posts (
  title, slug, excerpt, body, coverImage, categoryId, authorName, status,
  publishedAt, seoTitle, seoDescription, deletedAt, createdAt, updatedAt
)
SELECT
  'How to Select a 100 GPD RO Water Purifier for Distribution', 'how-to-select-a-100-gpd-ro-water-purifier', 'A practical model-selection guide for distributors and private-label buyers comparing 100 GPD under-sink RO water purifiers.', '<h2>How to Select a 100 GPD RO Water Purifier for Distribution</h2>
<p>A 100 GPD RO water purifier is not one standard product. Models with the same nominal membrane capacity can differ in filtration stages, storage tank, cabinet size, control system, connections, consumables and optional features. Distributors and private-label buyers should therefore compare complete configurations rather than treating “100 GPD” as the full specification.</p>
<p>This guide explains what to confirm before shortlisting a model or requesting an OEM quotation. Rated capacity is a model specification, not a guarantee of identical output under every water, pressure and temperature condition.</p>
<h3>1. Confirm the intended application</h3>
<p>Start with the installation and buyer profile. Is the product intended for a residential under-sink installation, a compact cabinet solution, a display-equipped model or another channel-specific position? Confirm available space, feed-water conditions, drainage, faucet arrangement and electrical requirements where controls or pumps are included.</p>
<p>Buyers can first review Li-Men’s <a href="/products/category/under-sink-ro-water-purifiers">under-sink RO water purifier category</a> to compare the available product families.</p>
<h3>2. Compare the complete filtration configuration</h3>
<p>The membrane rating alone does not describe the whole system. Ask for the exact filter sequence, pre-filters, post-treatment components, filter housings or cartridges and replacement references. A three-stage, four-stage or five-stage configuration should be evaluated by the actual components and the job each stage performs, not by stage count alone.</p>
<p>Also confirm which consumables are standard, which are optional and whether a private-label project requires customized labels or packaging for replacement filters.</p>
<h3>3. Check tank and cabinet requirements</h3>
<p>Many 100 GPD under-sink systems use a pressure tank, but tank capacity and cabinet dimensions vary. Verify the supplied tank, usable installation space, tubing layout and service access. A compact cabinet may fit one distribution channel, while a model with a larger control box or different enclosure may support another product position.</p>
<p>For example, the <a href="/products/100-gpd-5-stage-under-sink-ro-water-purifier">M29-RO100 compact 100 GPD five-stage RO purifier</a> uses a compact cabinet and an optional display. The <a href="/products/100-gpd-5-stage-under-sink-ro-water-purifier-2">M30-RO100 100 GPD purifier with display control box</a> is a distinct model with a different cabinet format and optional display control box. Buyers should compare the current model specification rather than selecting from the capacity label alone.</p>
<h3>4. Separate standard and optional controls</h3>
<p>Display panels, pressure indicators, reminders and other controls may be standard on one configuration and optional on another. Ask the manufacturer to identify the quoted configuration in writing. The approved sample, specification, packaging list and quotation should describe the same control option.</p>
<h3>5. Confirm operating and installation conditions</h3>
<p>Request the model’s applicable feed-water, pressure, temperature and electrical information. Actual production can vary with operating conditions and membrane selection. If a buyer needs a specific project output, the inquiry should include available source-water and installation information instead of relying only on the nominal GPD value.</p>
<h3>6. Define the OEM or private-label scope</h3>
<p>State whether the project requires only a logo, or also packaging, labels, manuals, appearance changes, accessories or component changes. MOQ, sample process, price and lead time depend on the selected model and customization scope and should be confirmed in a model-specific quotation.</p>
<h3>7. Review documents for the selected model and market</h3>
<p>Do not assume that a general factory certificate automatically applies to every product configuration or destination market. Check the named company, product reference, scope, issuer and date. Review Li-Men’s available <a href="/certificates">certificates and conformity documents</a>, then request confirmation for the shortlisted model and market.</p>
<h3>8. Send a useful quotation request</h3>
<p>Include the shortlisted model, destination market, expected quantity, required customization, packaging needs, sample request, installation conditions and documentation questions. A detailed request lets the manufacturer confirm what is standard, what is optional and what still requires technical review.</p>
<p>To compare M29-RO100, M30-RO100 or another 100 GPD configuration, <a href="/contact">send a model-specific inquiry</a>.</p>
<h3>Frequently asked questions</h3>
<h4>Is every 100 GPD RO purifier suitable for the same installation?</h4>
<p>No. Products can differ in cabinet size, tank, connections, controls, electrical requirements and service access. Confirm the selected model against the intended installation.</p>
<h4>Does a five-stage system automatically outperform a three-stage system?</h4>
<p>Stage count alone is not enough to make that conclusion. Compare the actual components, water conditions, treatment objective and validated model specification.</p>
<h4>Can a 100 GPD model be private labeled?</h4>
<p>Private-label and OEM feasibility depends on the selected model, branding, packaging, quantity and requested changes. These items should be confirmed in a project quotation.</p>', NULL,
  (SELECT id FROM blog_categories WHERE slug = 'general' AND published = 1 LIMIT 1),
  'Li-Men Editorial Team', 'PUBLISHED',
  CAST(strftime('%s','now') AS INTEGER) * 1000,
  '100 GPD RO Water Purifier Selection Guide for Distributors', 'Compare 100 GPD RO water purifiers by configuration, tank, filtration stages, controls, installation and OEM requirements before requesting a quote.', NULL,
  CAST(strftime('%s','now') AS INTEGER) * 1000,
  CAST(strftime('%s','now') AS INTEGER) * 1000
WHERE NOT EXISTS (SELECT 1 FROM blog_posts WHERE slug = 'how-to-select-a-100-gpd-ro-water-purifier');

INSERT INTO blog_post_translations (
  postId, locale, title, excerpt, body, seoTitle, seoDescription,
  translationStatus, updatedBy, createdAt, updatedAt
)
SELECT id, 'es', 'Cómo seleccionar un purificador RO de 100 GPD para distribución', 'Guía práctica para distribuidores y marcas privadas que comparan purificadores RO de 100 GPD bajo fregadero.', '<h2>Cómo seleccionar un purificador RO de 100 GPD para distribución</h2>
<p>Un purificador RO de 100 GPD no es un producto estándar único. Dos modelos con la misma capacidad nominal de membrana pueden tener distintas etapas, depósito, gabinete, controles, conexiones, consumibles y funciones opcionales. Por eso, un distribuidor debe comparar configuraciones completas y no usar “100 GPD” como única especificación.</p>
<p>La capacidad nominal es una característica del modelo. No garantiza el mismo caudal bajo cualquier calidad de agua, presión o temperatura.</p>
<h3>1. Defina la aplicación prevista</h3>
<p>Confirme el tipo de instalación, el espacio disponible, las condiciones del agua de entrada, el drenaje, el grifo y los requisitos eléctricos. Consulte primero la categoría de <a href="/es/products/category/under-sink-ro-water-purifiers">purificadores RO bajo fregadero</a> para identificar las familias adecuadas.</p>
<h3>2. Compare la configuración completa</h3>
<p>Solicite la secuencia exacta de filtros, los prefiltros, el postratamiento y las referencias de los consumibles. Una configuración de tres, cuatro o cinco etapas debe evaluarse por sus componentes y funciones, no solo por el número de etapas.</p>
<h3>3. Compruebe el depósito y el gabinete</h3>
<p>Verifique el depósito incluido, las dimensiones, la disposición de los tubos y el acceso para mantenimiento. El <a href="/es/products/100-gpd-5-stage-under-sink-ro-water-purifier">M29-RO100 compacto de cinco etapas</a> utiliza un gabinete compacto y puede incorporar pantalla opcional. El <a href="/es/products/100-gpd-5-stage-under-sink-ro-water-purifier-2">M30-RO100 con caja de control de pantalla</a> es otro modelo, con un formato de gabinete diferente. La selección debe basarse en la ficha vigente del modelo.</p>
<h3>4. Separe funciones estándar y opcionales</h3>
<p>La pantalla, los indicadores o recordatorios pueden ser estándar en una configuración y opcionales en otra. La muestra aprobada, la ficha, la lista de embalaje y la cotización deben describir la misma opción.</p>
<h3>5. Confirme las condiciones de funcionamiento</h3>
<p>Solicite los datos aplicables de agua de entrada, presión, temperatura y electricidad. El rendimiento real puede variar según las condiciones y la membrana. Para un proyecto específico, facilite al fabricante la información disponible de la instalación.</p>
<h3>6. Defina el alcance OEM o de marca privada</h3>
<p>Indique si necesita solo logotipo o también embalaje, etiquetas, manuales, apariencia, accesorios o cambios de componentes. MOQ, muestras, precio y plazo dependen del modelo y del alcance acordado.</p>
<h3>7. Revise los documentos del modelo y mercado</h3>
<p>Un certificado general no cubre automáticamente todas las configuraciones o mercados. Compruebe empresa, referencia, alcance, emisor y fecha. Consulte los <a href="/es/certificates">certificados y documentos disponibles</a> y solicite confirmación para el modelo elegido.</p>
<h3>8. Envíe una solicitud de cotización completa</h3>
<p>Incluya modelo, mercado, cantidad estimada, personalización, embalaje, muestras, condiciones de instalación y preguntas documentales. Para comparar M29-RO100, M30-RO100 u otra configuración, envíe una <a href="/es/contact">consulta específica</a>.</p>
<h3>Preguntas frecuentes</h3>
<h4>¿Todos los modelos de 100 GPD sirven para la misma instalación?</h4>
<p>No. Pueden diferir en gabinete, depósito, conexiones, controles, electricidad y mantenimiento.</p>
<h4>¿Cinco etapas siempre significan mejor rendimiento?</h4>
<p>No puede determinarse solo por el número. Compare componentes, objetivo de tratamiento, condiciones y especificación validada.</p>
<h4>¿Puede personalizarse un modelo de 100 GPD?</h4>
<p>La viabilidad depende del modelo, la marca, el embalaje, la cantidad y los cambios solicitados. Debe confirmarse mediante una cotización del proyecto.</p>',
  'Guía para seleccionar purificadores RO de 100 GPD', 'Compare purificadores RO de 100 GPD por configuración, depósito, etapas, controles, instalación y requisitos OEM antes de cotizar.', 'PUBLISHED', NULL,
  CAST(strftime('%s','now') AS INTEGER) * 1000,
  CAST(strftime('%s','now') AS INTEGER) * 1000
FROM blog_posts
WHERE slug = 'how-to-select-a-100-gpd-ro-water-purifier'
  AND NOT EXISTS (
    SELECT 1 FROM blog_post_translations t
    WHERE t.postId = blog_posts.id AND t.locale = 'es'
  );

INSERT INTO blog_posts (
  title, slug, excerpt, body, coverImage, categoryId, authorName, status,
  publishedAt, seoTitle, seoDescription, deletedAt, createdAt, updatedAt
)
SELECT
  'OEM vs ODM vs Private Label Water Purifiers: A Buyer Responsibility Guide', 'oem-vs-odm-vs-private-label-water-purifiers', 'A practical guide to defining supplier and buyer responsibilities in OEM, ODM and private-label water purifier projects.', '<h2>OEM vs ODM vs Private Label Water Purifiers</h2>
<p>OEM, ODM and private label are often used as broad sales terms, but they do not define a complete project by themselves. For a water purifier buyer, the useful question is: who is responsible for the base product, requested changes, branding, packaging, documentation, validation and final approval?</p>
<p>Define those responsibilities before comparing quotations. Two suppliers may use the same label while offering different work.</p>
<h3>Private label: branding an existing configuration</h3>
<p>A private-label project commonly starts with an existing model and adds approved branding, labels, packaging or manuals. The buyer should identify the exact base model and confirm which changes are included. Even a simple logo project needs an approval record covering artwork, colors, positions and packaging files.</p>
<p>Private label can be suitable when the priority is a faster catalog launch with limited product changes. MOQ, cost and timing still depend on the model and requested materials.</p>
<h3>OEM: manufacturing to an agreed specification</h3>
<p>OEM may describe production of a selected product under the buyer’s brand or manufacturing against a more detailed buyer specification. The scope can include component selection, functions, accessories, appearance, packaging and documentation coordination.</p>
<p>The parties should record the approved specification, sample, acceptable substitutions, inspection points and change process. The term OEM does not by itself prove that every requested modification is feasible.</p>
<h3>ODM: broader product-development responsibility</h3>
<p>ODM can involve a supplier contributing more product design or development responsibility. The commercial and technical scope may include industrial design, tooling, electronics, control logic, packaging or documentation. Responsibilities for intellectual property, testing, approvals, design changes and ownership of project outputs should be agreed in writing.</p>
<h3>What every project should define</h3>
<p>Regardless of the label, define:</p>
<ul>
<li>exact base model or approved specification;</li>
<li>standard and customized components;</li>
<li>branding, color, label, manual and packaging files;</li>
<li>destination market and document questions;</li>
<li>sample stages and approval authority;</li>
<li>quality checks and retained records;</li>
<li>acceptable changes and substitution approval;</li>
<li>estimated quantity, schedule and commercial quotation.</li>
</ul>
<h3>Why sample approval needs a checklist</h3>
<p>A sample should not be approved only by appearance. Record the model, filtration configuration, controls, accessories, labels, packaging and documents. If a later quotation or production order uses a different configuration, the difference should be visible and approved.</p>
<h3>How to compare supplier quotations</h3>
<p>Compare quotations only after aligning the scope. A lower price may refer to a different membrane, filter set, tank, control option, accessory pack, packaging or documentation responsibility. Ask suppliers to list exclusions and optional items.</p>
<p>Use Li-Men’s <a href="/blog/how-to-evaluate-a-water-purifier-manufacturer">manufacturer evaluation checklist</a> for broader supplier qualification, review the <a href="/products">product portfolio</a>, and submit an <a href="/contact">OEM/ODM project inquiry</a> with the selected model and requested changes.</p>
<h3>Frequently asked questions</h3>
<h4>Is private label always the same as OEM?</h4>
<p>No. Suppliers use the terms differently. Define the actual deliverables instead of relying on the label.</p>
<h4>Does ODM mean the supplier owns every design?</h4>
<p>Not automatically. Design inputs, tooling, intellectual property and output ownership should be addressed in the project agreement.</p>
<h4>When should certification be reviewed?</h4>
<p>Review document applicability before finalizing the product and again when the configuration or destination market changes.</p>', NULL,
  (SELECT id FROM blog_categories WHERE slug = 'general' AND published = 1 LIMIT 1),
  'Li-Men Editorial Team', 'PUBLISHED',
  CAST(strftime('%s','now') AS INTEGER) * 1000,
  'OEM vs ODM vs Private Label Water Purifiers | Buyer Guide', 'Understand OEM, ODM and private-label water purifier projects by product responsibility, customization, samples, documentation and change control.', NULL,
  CAST(strftime('%s','now') AS INTEGER) * 1000,
  CAST(strftime('%s','now') AS INTEGER) * 1000
WHERE NOT EXISTS (SELECT 1 FROM blog_posts WHERE slug = 'oem-vs-odm-vs-private-label-water-purifiers');

INSERT INTO blog_post_translations (
  postId, locale, title, excerpt, body, seoTitle, seoDescription,
  translationStatus, updatedBy, createdAt, updatedAt
)
SELECT id, 'es', 'OEM vs ODM vs marca privada en purificadores de agua', 'Guía práctica para definir responsabilidades del comprador y del fabricante en proyectos de purificadores de agua.', '<h2>OEM vs ODM vs marca privada en purificadores de agua</h2>
<p>OEM, ODM y marca privada son términos comerciales amplios. No definen por sí solos un proyecto completo. Para el comprador, la pregunta útil es quién responde por el producto base, los cambios, la marca, el embalaje, los documentos, la validación y la aprobación final.</p>
<h3>Marca privada: adaptar una configuración existente</h3>
<p>Normalmente parte de un modelo existente e incorpora logotipo, etiquetas, embalaje o manuales aprobados. Debe identificarse el modelo base y registrar archivos, colores, posiciones y materiales aprobados. Es una opción adecuada cuando se busca lanzar un catálogo con cambios limitados.</p>
<h3>OEM: fabricar según una especificación acordada</h3>
<p>OEM puede significar producir un modelo bajo la marca del comprador o fabricar según una especificación más detallada. El alcance puede incluir componentes, funciones, accesorios, apariencia, embalaje y coordinación documental. Deben registrarse la ficha aprobada, la muestra, las sustituciones aceptables y el proceso de cambios.</p>
<h3>ODM: mayor responsabilidad de desarrollo</h3>
<p>ODM puede incluir diseño industrial, herramientas, electrónica, lógica de control, embalaje o documentación. Las responsabilidades sobre propiedad intelectual, ensayos, aprobaciones, cambios y propiedad de los resultados deben acordarse por escrito.</p>
<h3>Elementos que todo proyecto debe definir</h3>
<ul>
<li>modelo base o especificación aprobada;</li>
<li>componentes estándar y personalizados;</li>
<li>marca, color, etiquetas, manuales y embalaje;</li>
<li>mercado de destino y preguntas documentales;</li>
<li>etapas de muestra y autoridad de aprobación;</li>
<li>controles de calidad y registros;</li>
<li>cambios permitidos y aprobación de sustituciones;</li>
<li>cantidad estimada, calendario y cotización.</li>
</ul>
<h3>Compare cotizaciones con el mismo alcance</h3>
<p>Un precio menor puede referirse a otra membrana, filtros, depósito, controles, accesorios, embalaje o responsabilidad documental. Solicite exclusiones y opciones por escrito.</p>
<p>Utilice la <a href="/es/blog/how-to-evaluate-a-water-purifier-manufacturer">lista para evaluar fabricantes</a>, revise el <a href="/es/products">catálogo de productos</a> y envíe una <a href="/es/contact">consulta OEM/ODM</a> con el modelo y los cambios requeridos.</p>
<h3>Preguntas frecuentes</h3>
<h4>¿Marca privada y OEM siempre son lo mismo?</h4>
<p>No. Cada proveedor puede usar los términos de manera distinta. Defina entregables concretos.</p>
<h4>¿ODM significa que el proveedor posee todo el diseño?</h4>
<p>No necesariamente. Propiedad intelectual, herramientas y resultados deben definirse contractualmente.</p>
<h4>¿Cuándo se revisan los certificados?</h4>
<p>Antes de cerrar el producto y cada vez que cambien la configuración o el mercado.</p>',
  'OEM vs ODM vs marca privada en purificadores | Guía', 'Comprenda proyectos OEM, ODM y marca privada según responsabilidades, personalización, muestras, documentos y control de cambios.', 'PUBLISHED', NULL,
  CAST(strftime('%s','now') AS INTEGER) * 1000,
  CAST(strftime('%s','now') AS INTEGER) * 1000
FROM blog_posts
WHERE slug = 'oem-vs-odm-vs-private-label-water-purifiers'
  AND NOT EXISTS (
    SELECT 1 FROM blog_post_translations t
    WHERE t.postId = blog_posts.id AND t.locale = 'es'
  );

INSERT INTO blog_posts (
  title, slug, excerpt, body, coverImage, categoryId, authorName, status,
  publishedAt, seoTitle, seoDescription, deletedAt, createdAt, updatedAt
)
SELECT
  'How to Verify Water Purifier Certificates for a Target Market', 'how-to-verify-water-purifier-certificates', 'A due-diligence checklist for checking whether a certificate or conformity document is relevant to a selected water purifier and market.', '<h2>How to Verify Water Purifier Certificates for a Target Market</h2>
<p>Finding a certificate on a supplier website is the beginning of document review, not the end. A document may apply to a company, product family, named model, component, management system or test sample. It may not cover every configuration or every destination market.</p>
<p>Buyers should review the document and then confirm applicability with the supplier, their importer and qualified local advisers where required.</p>
<h3>1. Identify the document type</h3>
<p>Determine whether the file is a certificate, test report, declaration, management-system document or another conformity record. These documents serve different purposes. A factory management certificate does not automatically prove product-level conformity.</p>
<h3>2. Check the named organization</h3>
<p>Confirm the legal entity shown on the document and its relationship to the proposed manufacturer or exporter. Record the certificate or report number so the parties are discussing the same file.</p>
<h3>3. Check the product and model scope</h3>
<p>Look for product descriptions, model numbers, families or referenced standards. If the shortlisted model is not clearly named, ask the supplier to explain the relationship and provide supporting documentation. Do not infer coverage from a similar appearance or capacity.</p>
<h3>4. Review configuration dependencies</h3>
<p>Electrical ratings, pumps, heating, cooling, controls, materials and other options can affect document applicability. Confirm whether the quoted and sampled configuration matches the configuration covered by the document.</p>
<h3>5. Review issuer, date and current status</h3>
<p>Identify the issuing or testing organization, issue date, expiry date where applicable and any revision or annex. If an online verification method is available from the issuer, use the document number and named company to check it.</p>
<h3>6. Separate component and finished-product evidence</h3>
<p>A membrane, pump, power supply or material report may support a component claim. It does not automatically become finished-product certification. Record whether each document concerns a component, a complete product, a factory system or a specific sample.</p>
<h3>7. Confirm destination-market requirements</h3>
<p>Requirements can vary by country, sales channel, electrical configuration and product function. A document accepted for one project may not be sufficient for another. The importer or buyer remains responsible for determining applicable local requirements with qualified advisers.</p>
<h3>8. Keep a model-level document register</h3>
<p>For each shortlisted model, maintain a simple record of document name, number, entity, product scope, configuration, issuer, date, file version, verification result and open questions. Recheck when the product, component, packaging, market or regulation changes.</p>
<p>Li-Men publishes available <a href="/certificates">certificates and conformity documents</a> for buyer review. Use the <a href="/blog/how-to-evaluate-a-water-purifier-manufacturer">manufacturer evaluation checklist</a> to connect documentation with product specifications, samples and quality controls. For a selected model and market, <a href="/contact">send a document-specific inquiry</a>.</p>
<h3>Frequently asked questions</h3>
<h4>Does one certificate cover every water purifier sold by a manufacturer?</h4>
<p>Not necessarily. Coverage depends on the named entity, product scope, models, configuration, standard and document conditions.</p>
<h4>Is a component certificate the same as finished-product certification?</h4>
<p>No. It may be relevant evidence for one component, but its scope should not be represented as coverage of the complete product unless the document says so.</p>
<h4>Can a supplier guarantee acceptance in every market?</h4>
<p>Market requirements and acceptance decisions are not universal. Confirm requirements for the destination, product and sales channel with appropriate local expertise.</p>', NULL,
  (SELECT id FROM blog_categories WHERE slug = 'general' AND published = 1 LIMIT 1),
  'Li-Men Editorial Team', 'PUBLISHED',
  CAST(strftime('%s','now') AS INTEGER) * 1000,
  'How to Verify Water Purifier Certificates | B2B Checklist', 'Check water purifier certificates by company, model, scope, issuer, date, configuration and target-market requirements before supplier approval.', NULL,
  CAST(strftime('%s','now') AS INTEGER) * 1000,
  CAST(strftime('%s','now') AS INTEGER) * 1000
WHERE NOT EXISTS (SELECT 1 FROM blog_posts WHERE slug = 'how-to-verify-water-purifier-certificates');

INSERT INTO blog_post_translations (
  postId, locale, title, excerpt, body, seoTitle, seoDescription,
  translationStatus, updatedBy, createdAt, updatedAt
)
SELECT id, 'es', 'Cómo verificar certificados de purificadores de agua para un mercado', 'Lista de debida diligencia para comprobar si un certificado corresponde al purificador y al mercado seleccionados.', '<h2>Cómo verificar certificados de purificadores de agua</h2>
<p>Encontrar un certificado en la web de un proveedor es el inicio de la revisión. Un documento puede corresponder a una empresa, familia de productos, modelo, componente, sistema de gestión o muestra ensayada. No siempre cubre todas las configuraciones o mercados.</p>
<h3>1. Identifique el tipo de documento</h3>
<p>Determine si se trata de certificado, informe de ensayo, declaración o documento de sistema de gestión. Cada tipo cumple una función diferente. Un certificado de gestión de fábrica no demuestra automáticamente la conformidad de un producto.</p>
<h3>2. Compruebe la organización indicada</h3>
<p>Confirme la entidad legal y su relación con el fabricante o exportador propuesto. Registre el número del documento.</p>
<h3>3. Revise el producto y los modelos cubiertos</h3>
<p>Busque descripciones, números de modelo, familias o normas citadas. Si el modelo seleccionado no aparece claramente, solicite una explicación y documentación de respaldo. No deduzca cobertura por apariencia o capacidad similar.</p>
<h3>4. Revise la configuración</h3>
<p>Tensión, bomba, calentamiento, refrigeración, controles, materiales y opciones pueden afectar la aplicabilidad. Confirme que la configuración cotizada y la muestra coincidan con la documentada.</p>
<h3>5. Compruebe emisor, fecha y estado</h3>
<p>Identifique organización emisora, fecha, vencimiento cuando corresponda, revisiones y anexos. Si el emisor ofrece verificación en línea, utilice el número y la empresa indicada.</p>
<h3>6. Separe componentes y producto terminado</h3>
<p>El informe de una membrana, bomba, fuente de alimentación o material puede respaldar ese componente. No se convierte automáticamente en certificación del producto completo.</p>
<h3>7. Confirme los requisitos del mercado</h3>
<p>Los requisitos varían por país, canal, configuración eléctrica y función. El importador o comprador debe determinar los requisitos aplicables con asesores cualificados.</p>
<h3>8. Mantenga un registro por modelo</h3>
<p>Registre documento, número, entidad, alcance, configuración, emisor, fecha, versión, verificación y preguntas abiertas. Revise de nuevo cuando cambien producto, componente, embalaje, mercado o normativa.</p>
<p>Li-Men publica los <a href="/es/certificates">certificados y documentos disponibles</a>. Relacione la documentación con producto, muestras y control de calidad mediante la <a href="/es/blog/how-to-evaluate-a-water-purifier-manufacturer">lista de evaluación del fabricante</a>. Para un modelo y mercado concretos, envíe una <a href="/es/contact">consulta documental</a>.</p>
<h3>Preguntas frecuentes</h3>
<h4>¿Un certificado cubre todos los productos del fabricante?</h4>
<p>No necesariamente. Depende de entidad, alcance, modelos, configuración, norma y condiciones.</p>
<h4>¿Un certificado de componente equivale al del producto terminado?</h4>
<p>No. Debe respetarse el alcance que indica el documento.</p>
<h4>¿El proveedor puede garantizar aceptación en cualquier mercado?</h4>
<p>No existe una aceptación universal. Confirme requisitos para el destino, producto y canal con conocimiento local adecuado.</p>',
  'Cómo verificar certificados de purificadores de agua', 'Revise certificados por empresa, modelo, alcance, emisor, fecha, configuración y requisitos del mercado antes de aprobar un proveedor.', 'PUBLISHED', NULL,
  CAST(strftime('%s','now') AS INTEGER) * 1000,
  CAST(strftime('%s','now') AS INTEGER) * 1000
FROM blog_posts
WHERE slug = 'how-to-verify-water-purifier-certificates'
  AND NOT EXISTS (
    SELECT 1 FROM blog_post_translations t
    WHERE t.postId = blog_posts.id AND t.locale = 'es'
  );

UPDATE blog_posts
SET body = body || '<h2>Related buyer guides</h2><ul><li><a href="/blog/how-to-select-a-100-gpd-ro-water-purifier">How to select a 100 GPD RO water purifier</a></li><li><a href="/blog/oem-vs-odm-vs-private-label-water-purifiers">OEM vs ODM vs private-label water purifiers</a></li><li><a href="/blog/how-to-verify-water-purifier-certificates">How to verify water purifier certificates</a></li></ul>', updatedAt = CAST(strftime('%s','now') AS INTEGER) * 1000
WHERE slug = 'how-to-evaluate-a-water-purifier-manufacturer'
  AND instr(body, '/blog/how-to-select-a-100-gpd-ro-water-purifier') = 0;

UPDATE blog_post_translations
SET body = body || '<h2>Guías relacionadas para compradores</h2><ul><li><a href="/es/blog/how-to-select-a-100-gpd-ro-water-purifier">Cómo seleccionar un purificador RO de 100 GPD</a></li><li><a href="/es/blog/oem-vs-odm-vs-private-label-water-purifiers">OEM vs ODM vs marca privada</a></li><li><a href="/es/blog/how-to-verify-water-purifier-certificates">Cómo verificar certificados de purificadores</a></li></ul>', updatedAt = CAST(strftime('%s','now') AS INTEGER) * 1000
WHERE locale = 'es'
  AND postId = (SELECT id FROM blog_posts WHERE slug = 'how-to-evaluate-a-water-purifier-manufacturer')
  AND instr(COALESCE(body, ''), '/es/blog/how-to-select-a-100-gpd-ro-water-purifier') = 0;
COMMIT;
