import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';
import { formatFCFA } from '@/utils/formatCurrency';
import { numberToFrenchWords } from '@/utils/frenchNumbers';

export interface ExportPdfOptions {
  fileName?: string;
  landscape?: boolean;
  scale?: number;
  quality?: number;
  receiptData?: any;
}

/**
 * Direct Fallback Vector PDF Generator using pure jsPDF when DOM capture fails
 * Accurately reproduces the official CFP-ITMC Douala receipt layout
 */
export function generateDirectReceiptPDF(receipt: any, fileName: string = 'Recu_CFP_ITMC.pdf') {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const isIncome = receipt.type === 'income';
    const isCancelled = receipt.status === 'Annulé' || receipt.cancelled === true;
    const amountInWords = numberToFrenchWords(Number(receipt.amount) || 0);
    const dateFormatted = new Date(receipt.date || Date.now()).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const drawVolet = (startY: number, titleVolet: string) => {
      // Outer Rounded Border
      doc.setDrawColor(203, 213, 225); // slate-300
      doc.setLineWidth(0.6);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(10, startY, 190, 128, 3, 3, 'FD');

      // Watermark "CFP-ITMC DOUALA" in background
      doc.setTextColor(241, 245, 249); // slate-100 very subtle watermark
      doc.setFontSize(36);
      doc.setFont('helvetica', 'bold');
      doc.text("CFP-ITMC DOUALA", 105, startY + 68, { align: 'center', angle: 15 });

      // Cancelled Banner if applicable
      if (isCancelled) {
        doc.setFillColor(254, 226, 226);
        doc.setDrawColor(248, 113, 113);
        doc.roundedRect(12, startY + 2, 186, 7, 1.5, 1.5, 'FD');
        doc.setTextColor(185, 28, 28);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.text(`DOCUMENT ANNULÉ - TRANSACTION INVALIDE (${receipt.cancellationReason || 'Annulation administrative'})`, 105, startY + 6.5, { align: 'center' });
      }

      const contentY = isCancelled ? startY + 12 : startY + 5;

      // Top Security Bar
      doc.setTextColor(30, 58, 138); // blue-900
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text(titleVolet, 14, contentY);

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(7);
      doc.text(`Sécurité Doc : #${receipt.receiptNumber}`, 186, contentY, { align: 'right' });

      // Institute Header Separator Line
      doc.setDrawColor(15, 23, 42); // slate-900
      doc.setLineWidth(0.7);
      doc.line(14, contentY + 2.5, 186, contentY + 2.5);

      // Institute Branding
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text("CFP-ITMC DOUALA", 14, contentY + 8);

      // MINEFOP Tag
      doc.setFillColor(219, 234, 254); // blue-100
      doc.roundedRect(58, contentY + 4.5, 58, 4.5, 1, 1, 'F');
      doc.setTextColor(30, 58, 138);
      doc.setFontSize(5.5);
      doc.setFont('helvetica', 'bold');
      doc.text("MINISTÈRE DE L'EMPLOI ET DE LA FORMATION (MINEFOP)", 87, contentY + 7.7, { align: 'center' });

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      doc.text("Institut de Formation Professionnelle aux Métiers des Technologies & du Management", 14, contentY + 12);
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text("Arrêté d'homologation MINEFOP • Douala Logpom (Carrefour Bassong) • Tél: (+237) 683 66 32 22 / 688 05 20 94", 14, contentY + 15.5);

      // Receipt Box on Top Right
      const isRegistration = receipt.category === 'inscription';
      const badgeBg = isIncome ? (isRegistration ? [254, 243, 199] : [209, 250, 229]) : [254, 226, 226];
      const badgeText = isIncome ? (isRegistration ? [120, 53, 15] : [6, 78, 59]) : [153, 27, 27];

      doc.setFillColor(badgeBg[0], badgeBg[1], badgeBg[2]);
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.roundedRect(125, contentY + 3.5, 61, 14, 2, 2, 'FD');

      doc.setTextColor(badgeText[0], badgeText[1], badgeText[2]);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      const categoryLabel = isIncome 
        ? (isRegistration ? "FRAIS D'INSCRIPTION & DOSSIER" : `PENSION : ${receipt.tranche || 'Scolarité'}`)
        : "BON DE DÉCAISSEMENT CAISSE";
      doc.text(categoryLabel, 155.5, contentY + 8, { align: 'center' });

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(9);
      doc.text(`N° ${receipt.receiptNumber}`, 155.5, contentY + 12.5, { align: 'center' });

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(6);
      doc.text(`Année Académique : ${receipt.academicYear || '2026-2027'}`, 155.5, contentY + 16, { align: 'center' });

      // Beneficiary & Payment Details Box
      const boxY = contentY + 20;
      doc.setFillColor(248, 250, 252); // slate-50
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.4);
      doc.roundedRect(14, boxY, 172, 22, 2, 2, 'FD');

      // Left Column: Student Details
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(6);
      doc.setFont('helvetica', 'bold');
      doc.text(isIncome ? "APPRENANT(E) / BÉNÉFICIAIRE DE LA FORMATION" : "BÉNÉFICIAIRE / TIERS", 18, boxY + 4.5);

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(9);
      doc.text(receipt.studentName || receipt.beneficiary || "Apprenant ITMC", 18, boxY + 9.5);

      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      if (receipt.matricule) {
        doc.text(`Matricule : ${receipt.matricule}`, 18, boxY + 14);
      }
      if (receipt.specialty) {
        doc.text(`Spécialité DQP : ${receipt.specialty}`, 18, boxY + 18);
      }

      // Middle Vertical Divider Line
      doc.setDrawColor(226, 232, 240);
      doc.line(105, boxY + 3, 105, boxY + 19);

      // Right Column: Payment Details
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(6);
      doc.setFont('helvetica', 'bold');
      doc.text("DÉTAILS DU RÈGLEMENT & CAISSE", 110, boxY + 4.5);

      doc.setTextColor(51, 65, 85);
      doc.setFontSize(7);
      doc.text(`Date & Heure : ${dateFormatted}`, 110, boxY + 9);
      doc.text(`Mode : ${(receipt.paymentMethod || 'Espèces').toUpperCase()}`, 110, boxY + 13.5);
      doc.text(`Opérateur : ${receipt.recordedBy || 'Direction / Caisse Principale'}`, 110, boxY + 18);

      // Transaction Amount & Designation Box
      const itemY = boxY + 26;
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(14, itemY, 172, 6, 1, 1, 'FD');

      doc.setTextColor(51, 65, 85);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.text("DÉSIGNATION & MOTIF DU VERSEMENT", 18, itemY + 4.2);
      doc.text("MONTANT RÉGLÉ", 182, itemY + 4.2, { align: 'right' });

      // Body of Designation Box
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(14, itemY + 6, 172, 22, 1, 1, 'FD');

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(receipt.title || "Versement de Scolarité", 18, itemY + 12);

      if (receipt.tranche) {
        doc.setFontSize(7);
        doc.setTextColor(29, 78, 216);
        doc.text(`Tranche acquittée : ${receipt.tranche}`, 18, itemY + 16.5);
      }

      // Amount highlighted on the right
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(125, itemY + 8.5, 57, 10, 2, 2, 'FD');
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(formatFCFA(receipt.amount), 153.5, itemY + 15, { align: 'center' });

      // In Words Line
      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'normal');
      doc.text("Arrêté la présente quittance à la somme de :", 18, itemY + 23);
      doc.setFont('helvetica', 'bolditalic');
      doc.setTextColor(15, 23, 42);
      doc.text(`« ${amountInWords} Francs CFA »`, 72, itemY + 23);

      // Signatures & Security Stamp Section
      const sigY = itemY + 31;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text("L'Apprenant / Déposant", 18, sigY);
      doc.text("Visa & Cachet Caisse Principale", 182, sigY, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(148, 163, 184);
      doc.text("Mention « Lu et approuvé »", 18, sigY + 11);

      // Official Stamp
      doc.setFillColor(239, 246, 255);
      doc.setDrawColor(37, 99, 235);
      doc.roundedRect(128, sigY + 3, 58, 8, 1.5, 1.5, 'FD');
      doc.setTextColor(30, 58, 138);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'bold');
      doc.text("DIRECTION FINANCIÈRE • CAISSE CENTRALE", 157, sigY + 7.5, { align: 'center' });
      doc.setFontSize(6);
      doc.setTextColor(100, 116, 139);
      doc.text(`Douala, le ${new Date().toLocaleDateString('fr-FR')}`, 157, sigY + 13.5, { align: 'center' });

      // Legal subtext
      doc.setFontSize(5.5);
      doc.setTextColor(148, 163, 184);
      doc.text("Quittance libératoire certifiée conforme et infalsifiable • CFP-ITMC Douala", 105, startY + 125, { align: 'center' });
    };

    // Volet 1 (Top: Exemplaire Étudiant)
    drawVolet(8, isIncome ? "VOLET 1 : EXEMPLAIRE ÉTUDIANT (QUITTANCE LIBÉRATOIRE)" : "VOLET 1 : EXEMPLAIRE BÉNÉFICIAIRE");

    // Perforation / Scissor cutting Line between the two vouchers
    doc.setDrawColor(148, 163, 184);
    doc.setLineDashPattern([2, 2], 0);
    doc.line(10, 142.5, 200, 142.5);
    doc.setLineDashPattern([], 0);

    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(65, 140.5, 80, 4, 1, 1, 'FD');
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(5.5);
    doc.setFont('helvetica', 'bold');
    doc.text("✂ LIGNE DE DÉCOUPE OFFICIELLE • SOUCHE ARCHIVE COMPTABILITÉ", 105, 143.5, { align: 'center' });

    // Volet 2 (Bottom: Exemplaire Institut / Souche Caisse)
    drawVolet(149, isIncome ? "VOLET 2 : SOUCHE ARCHIVE INSTITUT (CONTRÔLE & COMPTABILITÉ)" : "VOLET 2 : SOUCHE CAISSE CENTRALE");

    const cleanName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    doc.save(cleanName);
    toast.success(`Quittance "${cleanName}" téléchargée avec succès !`);
    return true;
  } catch (err) {
    console.error("Direct PDF Error:", err);
    toast.error("Erreur lors de la génération directe du PDF");
    return false;
  }
}

/**
 * High-Fidelity PDF Export using html-to-image (supports modern CSS / oklch) & jsPDF
 * Perfectly responsive, 100% faithful to the screen layout, lossless PNG color preservation
 */
export async function exportElementToPDF(
  element: HTMLElement | null,
  fileName: string = 'document_officiel_itmc',
  options: ExportPdfOptions = {}
): Promise<boolean> {
  const cleanFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;

  if (!element) {
    if (options.receiptData) {
      return generateDirectReceiptPDF(options.receiptData, cleanFileName);
    }
    toast.error("Élément introuvable pour la génération du PDF");
    return false;
  }

  const toastId = toast.loading("Génération du document PDF haute fidélité en cours...");

  // Select dimension parameters based on orientation
  const isLandscape = options.landscape || element.classList.contains('landscape-theme');
  const targetWidth = isLandscape ? '297mm' : '210mm';
  const targetHeight = isLandscape ? '210mm' : '297mm';

  // Check if it is a bulletin
  const isBulletin = element.classList.contains('itmc-bulletin-page') || element.id === 'bulletin';

  // 1. Create a pristine off-screen container on document.body
  const offscreenContainer = document.createElement('div');
  offscreenContainer.style.position = 'fixed';
  offscreenContainer.style.top = '-9999px';
  offscreenContainer.style.left = '-9999px';
  offscreenContainer.style.width = targetWidth;
  offscreenContainer.style.height = targetHeight;
  offscreenContainer.style.overflow = 'hidden';
  offscreenContainer.style.backgroundColor = '#ffffff';
  offscreenContainer.style.zIndex = '-99999';

  // Clone the node to decouple it from viewport sizes, zooms, or transforms
  const clone = element.cloneNode(true) as HTMLElement;

  // Remove screen-only transforms, scale and shadows to keep it pure vector style
  clone.style.transform = 'none';
  clone.style.transformOrigin = 'unset';
  clone.style.width = targetWidth;
  clone.style.height = targetHeight;
  clone.style.margin = '0';
  clone.style.boxShadow = 'none';
  clone.style.border = 'none';

  // Ensure children also behave appropriately in full-resolution print mode
  const wrap = clone.querySelector('.itmc-attestation-wrap, .itmc-bulletin-wrap') as HTMLElement;
  if (wrap) {
    wrap.style.transform = 'none';
    wrap.style.width = '100%';
    wrap.style.padding = '0';
  }

  offscreenContainer.appendChild(clone);
  document.body.appendChild(offscreenContainer);

  try {
    // 2. Wait slightly to let any assets or layout settle
    await new Promise((r) => setTimeout(r, 250));

    // Generate high-DPI image capture of the unscaled clone
    const imgData = await toPng(clone, {
      pixelRatio: options.scale || 3.0, // High-DPI scale for ultra-sharp text and graphics (3.0 produces ~300 DPI)
      backgroundColor: '#ffffff',
      style: {
        transform: 'none',
        backgroundColor: '#ffffff',
      }
    });

    // Clean up off-screen clone immediately
    document.body.removeChild(offscreenContainer);

    // Load capture to find proportional geometry
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = (e) => reject(e);
      img.src = imgData;
    });

    const pdf = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Set margins to 0 for a true full-bleed print fit (such as frames or bulletins)
    const margin = 0; 
    const availableWidth = pageWidth - (margin * 2);
    const availableHeight = pageHeight - (margin * 2);

    const imgWidth = availableWidth;
    const imgHeight = (img.height * imgWidth) / img.width;

    if (imgHeight <= availableHeight) {
      const verticalOffset = margin + Math.max(0, (availableHeight - imgHeight) / 2);
      pdf.addImage(imgData, 'PNG', margin, verticalOffset, imgWidth, imgHeight, undefined, 'FAST');
    } else {
      // Clean multi-page handling
      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= availableHeight;

      while (heightLeft > 0) {
        pdf.addPage();
        position -= availableHeight;
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= availableHeight;
      }
    }

    pdf.save(cleanFileName);
    toast.dismiss(toastId);
    toast.success(`Fichier "${cleanFileName}" téléchargé avec succès !`);
    return true;
  } catch (error) {
    console.error("PDF generation error, releasing memory:", error);
    if (document.body.contains(offscreenContainer)) {
      document.body.removeChild(offscreenContainer);
    }
    toast.dismiss(toastId);
    
    if (options.receiptData) {
      return generateDirectReceiptPDF(options.receiptData, cleanFileName);
    }
    
    toast.error("Échec de l'export PDF.");
    return false;
  }
}

/**
 * Direct A4 printing trigger using a clean invisible iframe that retains all styles without popup blocking
 */
export function printElementDirect(element: HTMLElement | null, documentTitle: string = 'Document_ITMC') {
  if (!element) {
    toast.error("Impossible d'imprimer ce document");
    return;
  }

  try {
    // Remove any existing print iframe
    const oldIframe = document.getElementById('print-service-iframe');
    if (oldIframe) {
      oldIframe.remove();
    }

    // Create an invisible iframe in the document
    const iframe = document.createElement('iframe');
    iframe.id = 'print-service-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.zIndex = '-9999';

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) {
      window.print();
      return;
    }

    // Collect all active styles and links from host document
    let styleHtml = '';
    document.querySelectorAll('style, link[rel="stylesheet"]').forEach(el => {
      styleHtml += el.outerHTML;
    });

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>${documentTitle}</title>
        ${styleHtml}
        <style>
          @page {
            size: A4 portrait;
            margin: 6mm;
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
            padding: 4px !important;
            font-family: system-ui, -apple-system, sans-serif !important;
          }
          .no-print {
            display: none !important;
          }
          @media print {
            body { padding: 0 !important; margin: 0 !important; }
          }
        </style>
      </head>
      <body>
        <div style="max-width: 820px; margin: 0 auto; background: #ffffff;">
          ${element.outerHTML}
        </div>
      </body>
      </html>
    `);
    doc.close();

    // Trigger print once iframe is ready
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error("Iframe print error:", err);
        window.print();
      } finally {
        setTimeout(() => {
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        }, 1500);
      }
    }, 400);
  } catch (error) {
    console.error("Print error, falling back to window.print:", error);
    window.print();
  }
}
