/**
 * Universal Certified Document & PDF Print Utility for ITMC Platform
 * Suppresses dirty browser headers (URL, time, date) and guarantees crisp A4 output
 */

interface PrintOptions {
  title?: string;
  landscape?: boolean;
  elementId?: string;
  htmlContent?: string;
}

export function printDocument({
  title = "Document_Officiel_ITMC",
  landscape = false,
  elementId,
  htmlContent
}: PrintOptions) {
  let content = htmlContent;

  if (elementId && !content) {
    const el = document.getElementById(elementId);
    if (el) {
      content = el.innerHTML;
    }
  }

  if (!content) {
    window.print();
    return;
  }

  const printIframe = document.createElement('iframe');
  printIframe.style.position = 'fixed';
  printIframe.style.top = '-9999px';
  printIframe.style.left = '-9999px';
  printIframe.style.width = '210mm';
  printIframe.style.height = '297mm';
  printIframe.style.border = 'none';
  printIframe.setAttribute('title', 'Zone d\'impression');

  document.body.appendChild(printIframe);

  const doc = printIframe.contentDocument || printIframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  const cleanTitle = title.replace(/[^\w.-]/gi, '_');

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>${cleanTitle}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
        
        @page {
          size: A4 ${landscape ? 'landscape' : 'portrait'};
          margin: 0mm; /* Supprime l'heure, la date et l'URL automatiques du navigateur */
        }

        *, *::before, *::after {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        html, body {
          background-color: #ffffff !important;
          color: #0f172a !important;
          margin: 0 !important;
          padding: 0 !important;
          font-family: 'Plus Jakarta Sans', 'Inter', system-ui, -apple-system, sans-serif !important;
          font-size: 11pt;
          line-height: 1.4;
          width: 100%;
        }

        .print-sheet {
          padding: 12mm 14mm;
          min-height: ${landscape ? '210mm' : '297mm'};
          background: #ffffff !important;
        }

        .no-print, nav, header, aside, button {
          display: none !important;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          page-break-inside: auto;
        }

        tr {
          page-break-inside: avoid;
          page-break-after: auto;
        }

        thead {
          display: table-header-group;
        }

        tfoot {
          display: table-footer-group;
        }

        .avoid-break {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }

        .border-official {
          border-color: #cbd5e1 !important;
        }
      </style>
    </head>
    <body>
      <div class="print-sheet">
        ${content}
      </div>
    </body>
    </html>
  `);
  doc.close();

  setTimeout(() => {
    try {
      printIframe.contentWindow?.focus();
      printIframe.contentWindow?.print();
    } catch (e) {
      console.error("Erreur lors de l'impression:", e);
    } finally {
      setTimeout(() => {
        if (document.body.contains(printIframe)) {
          document.body.removeChild(printIframe);
        }
      }, 1000);
    }
  }, 400);
}
