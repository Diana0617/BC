#!/usr/bin/env node

/**
 * Script para convertir GUIA_CONFIGURACION_WHATSAPP_META.md a PDF
 * 
 * Requisitos:
 * npm install marked puppeteer
 * 
 * Uso:
 * node scripts/generate-whatsapp-guide-pdf.js
 */

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const puppeteer = require('puppeteer');

const MARKDOWN_FILE = path.join(__dirname, '..', 'GUIA_CONFIGURACION_WHATSAPP_META.md');
const OUTPUT_PDF = path.join(__dirname, '..', 'docs', 'GUIA_CONFIGURACION_WHATSAPP_META.pdf');

// Estilos CSS para el PDF
const CSS_STYLES = `
<style>
  @page {
    margin: 2cm;
    size: A4;
  }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.6;
    color: #333;
    max-width: 100%;
  }
  
  h1 {
    color: #1a73e8;
    border-bottom: 3px solid #1a73e8;
    padding-bottom: 10px;
    margin-top: 30px;
    page-break-before: always;
  }
  
  h1:first-of-type {
    page-break-before: auto;
    font-size: 28pt;
    text-align: center;
    margin-bottom: 10px;
  }
  
  h2 {
    color: #0d47a1;
    border-bottom: 2px solid #e0e0e0;
    padding-bottom: 5px;
    margin-top: 25px;
  }
  
  h3 {
    color: #1565c0;
    margin-top: 20px;
  }
  
  h4 {
    color: #1976d2;
    margin-top: 15px;
  }
  
  code {
    background-color: #f5f5f5;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
    font-size: 9.5pt;
    color: #c7254e;
  }
  
  pre {
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-left: 4px solid #1a73e8;
    padding: 15px;
    border-radius: 4px;
    overflow-x: auto;
    page-break-inside: avoid;
  }
  
  pre code {
    background-color: transparent;
    padding: 0;
    color: #212529;
    font-size: 9pt;
  }
  
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 20px 0;
    page-break-inside: avoid;
    font-size: 10pt;
  }
  
  th {
    background-color: #1a73e8;
    color: white;
    padding: 12px;
    text-align: left;
    font-weight: 600;
  }
  
  td {
    border: 1px solid #dee2e6;
    padding: 10px;
  }
  
  tr:nth-child(even) {
    background-color: #f8f9fa;
  }
  
  blockquote {
    border-left: 4px solid #ffc107;
    background-color: #fffbf0;
    padding: 15px;
    margin: 15px 0;
    page-break-inside: avoid;
  }
  
  ul, ol {
    margin: 10px 0;
    padding-left: 30px;
  }
  
  li {
    margin: 5px 0;
  }
  
  .checkbox-list {
    list-style-type: none;
    padding-left: 0;
  }
  
  .checkbox-list li:before {
    content: '☐ ';
    margin-right: 8px;
    color: #1a73e8;
    font-size: 14pt;
  }
  
  img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 20px auto;
    page-break-inside: avoid;
  }
  
  hr {
    border: none;
    border-top: 2px solid #e0e0e0;
    margin: 30px 0;
  }
  
  /* Alertas/Advertencias */
  p:has(> strong:first-child) {
    padding: 12px;
    border-radius: 4px;
    margin: 15px 0;
  }
  
  /* Header del documento */
  .doc-header {
    text-align: center;
    margin-bottom: 40px;
    padding-bottom: 20px;
    border-bottom: 3px solid #1a73e8;
  }
  
  .doc-header h1 {
    border: none;
    margin: 0;
    padding: 0;
  }
  
  .doc-header p {
    color: #666;
    font-size: 11pt;
    margin: 5px 0;
  }
  
  /* Footer con número de página */
  @page {
    @bottom-right {
      content: "Página " counter(page) " de " counter(pages);
      font-size: 9pt;
      color: #666;
    }
    @bottom-left {
      content: "Beauty Control - WhatsApp Business Platform";
      font-size: 9pt;
      color: #666;
    }
  }
  
  /* Evitar orphans y widows */
  p, li, h3, h4 {
    orphans: 3;
    widows: 3;
  }
  
  /* Mantener títulos con su contenido */
  h2, h3, h4 {
    page-break-after: avoid;
  }
  
  /* Iconos de emojis */
  .emoji {
    font-size: 14pt;
  }
</style>
`;

async function convertMarkdownToPDF() {
  console.log('🚀 Generando PDF de la guía de configuración WhatsApp...\n');

  try {
    // 1. Leer archivo Markdown
    console.log('📖 Leyendo archivo Markdown...');
    const markdown = fs.readFileSync(MARKDOWN_FILE, 'utf-8');

    // 2. Convertir Markdown a HTML
    console.log('🔄 Convirtiendo Markdown a HTML...');
    const htmlContent = marked.parse(markdown);

    // 3. Crear HTML completo con estilos
    const fullHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Guía de Configuración WhatsApp Business Platform - Beauty Control</title>
  ${CSS_STYLES}
</head>
<body>
  ${htmlContent}
</body>
</html>
    `;

    // 4. Crear directorio docs si no existe
    const docsDir = path.dirname(OUTPUT_PDF);
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }

    // 5. Generar PDF con Puppeteer
    console.log('📄 Generando PDF con Puppeteer...');
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

    await page.pdf({
      path: OUTPUT_PDF,
      format: 'A4',
      margin: {
        top: '2cm',
        right: '2cm',
        bottom: '2cm',
        left: '2cm'
      },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="font-size: 9pt; color: #666; width: 100%; padding: 0 2cm; display: flex; justify-content: space-between;">
          <span>Beauty Control - WhatsApp Business Platform</span>
          <span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
        </div>
      `,
      preferCSSPageSize: false
    });

    await browser.close();

    // 6. Obtener tamaño del archivo
    const stats = fs.statSync(OUTPUT_PDF);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log('\n✅ PDF generado exitosamente!');
    console.log(`📁 Ubicación: ${OUTPUT_PDF}`);
    console.log(`📊 Tamaño: ${fileSizeInMB} MB`);
    console.log('\n🎉 ¡Listo para presentar!');

  } catch (error) {
    console.error('❌ Error generando PDF:', error.message);
    process.exit(1);
  }
}

// Ejecutar
convertMarkdownToPDF();
