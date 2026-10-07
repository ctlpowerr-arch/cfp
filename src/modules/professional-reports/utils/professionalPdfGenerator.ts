import jsPDF from 'jspdf';
import { ProfessionalReportAggregate } from '../types/professionalReport.types';

export function generateProfessionalReportPDF(aggregate: ProfessionalReportAggregate): void {
  const { report, template } = aggregate;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - 2 * margin;
  let cursorY = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - 16) {
      doc.addPage();
      cursorY = margin;
      drawHeaderWatermark();
    }
  };

  const drawHeaderWatermark = () => {
    doc.setTextColor(245, 247, 250);
    doc.setFontSize(36);
    doc.setFont('helvetica', 'bold');
    doc.text('CFP-ITMC DOUALA', 105, 140, { align: 'center', angle: 25 });
  };

  drawHeaderWatermark();

  // 1. En-tête Officiel CFP-ITMC
  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(margin, cursorY, contentWidth, 24, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('CFP-ITMC DOUALA • RAPPORT PROFESSIONNEL D’ACTIVITÉ', margin + 6, cursorY + 8);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('Centre de Formation Professionnelle aux Métiers des Technologies & du Management • MINEFOP', margin + 6, cursorY + 14);
  doc.text('Douala - Logpom (Carrefour Bassong) • info@cfp.itmc.com • (+237) 683 66 32 22 / 688 05 20 94', margin + 6, cursorY + 19);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(165, 180, 252); // indigo-200
  doc.text(report.reportNumber, pageWidth - margin - 6, cursorY + 9, { align: 'right' });

  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text(`Filière : ${report.specialtyName} • Année : ${report.academicYear}`, pageWidth - margin - 6, cursorY + 17, { align: 'right' });

  cursorY += 28;

  // Titre & Statut
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, cursorY, contentWidth, 16, 2, 2, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text(doc.splitTextToSize(`ACTIVITÉ : ${report.title}`, contentWidth - 45), margin + 4, cursorY + 6);

  // Badge Statut
  const statusLabels: Record<string, string> = {
    DRAFT: 'BROUILLON',
    SUBMITTED: 'SOUMIS',
    UNDER_REVIEW: 'EN ÉVALUATION',
    CHANGES_REQUESTED: 'CORRECTIONS',
    RESUBMITTED: 'RESOUMIS',
    APPROVED: 'VALIDÉ',
    ARCHIVED: 'ARCHIVÉ',
  };
  doc.setFillColor(30, 58, 138);
  doc.roundedRect(pageWidth - margin - 38, cursorY + 3.5, 34, 9, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text(statusLabels[report.status] || report.status, pageWidth - margin - 21, cursorY + 9, { align: 'center' });

  cursorY += 20;

  // 2. Grille Identité & Contexte
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, cursorY, contentWidth, 26, 1.5, 1.5, 'FD');

  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);

  const col1 = margin + 4;
  const col2 = margin + 70;
  const col3 = margin + 130;

  doc.setFont('helvetica', 'bold');
  doc.text('Apprenant :', col1, cursorY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`${report.studentName} (${report.studentMatricule})`, col1 + 22, cursorY + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('Filière / Spécialité :', col1, cursorY + 12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${report.specialtyName} [${report.specialtyCode}]`, col1 + 28, cursorY + 12);

  doc.setFont('helvetica', 'bold');
  doc.text('Classe / Groupe :', col1, cursorY + 18);
  doc.setFont('helvetica', 'normal');
  doc.text(`${report.classCode} (${report.formation})`, col1 + 24, cursorY + 18);

  doc.setFont('helvetica', 'bold');
  doc.text('Date :', col2, cursorY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`${report.activityDate} (${report.startTime} - ${report.endTime})`, col2 + 10, cursorY + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('Durée :', col2, cursorY + 12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${report.durationHours} heures`, col2 + 12, cursorY + 12);

  doc.setFont('helvetica', 'bold');
  doc.text('Lieu / Site :', col2, cursorY + 18);
  doc.setFont('helvetica', 'normal');
  doc.text(`${report.location}`, col2 + 18, cursorY + 18);

  doc.setFont('helvetica', 'bold');
  doc.text('Formateur :', col3, cursorY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`${report.assignedTeacherName}`, col3 + 18, cursorY + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('Organisme / Client :', col3, cursorY + 12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${report.clientOrHostOrg || 'CFP-ITMC'}`, col3 + 28, cursorY + 12);

  cursorY += 30;

  // 3. Données Dynamiques Spécifiques à la Spécialité
  if (report.dynamicValues && Object.keys(report.dynamicValues).length > 0) {
    checkPageBreak(25);
    doc.setFillColor(243, 244, 246);
    doc.rect(margin, cursorY, contentWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(31, 41, 55);
    doc.text(`PARAMÈTRES TECHNIQUES SPÉCIFIQUES — ${report.specialtyName.toUpperCase()}`, margin + 3, cursorY + 4.2);
    cursorY += 8;

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);

    for (const [key, val] of Object.entries(report.dynamicValues)) {
      if (val !== undefined && val !== null && val !== '') {
        checkPageBreak(8);
        doc.setFont('helvetica', 'bold');
        doc.text(`• ${key} :`, margin + 4, cursorY);
        doc.setFont('helvetica', 'normal');
        doc.text(String(val), margin + 45, cursorY);
        cursorY += 5;
      }
    }
    cursorY += 3;
  }

  // 4. Objectifs & Description
  checkPageBreak(30);
  doc.setFillColor(243, 244, 246);
  doc.rect(margin, cursorY, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(31, 41, 55);
  doc.text('OBJECTIFS & DESCRIPTION DES TRAVAUX RÉALISÉS', margin + 3, cursorY + 4.2);
  cursorY += 8;

  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);

  if (report.objectives) {
    doc.setFont('helvetica', 'bold');
    doc.text('Objectifs visés :', margin + 3, cursorY);
    doc.setFont('helvetica', 'normal');
    const objLines = doc.splitTextToSize(report.objectives, contentWidth - 25);
    doc.text(objLines, margin + 25, cursorY);
    cursorY += objLines.length * 4 + 2;
  }

  if (report.summaryDescription) {
    checkPageBreak(15);
    doc.setFont('helvetica', 'bold');
    doc.text('Description :', margin + 3, cursorY);
    doc.setFont('helvetica', 'normal');
    const descLines = doc.splitTextToSize(report.summaryDescription, contentWidth - 25);
    doc.text(descLines, margin + 25, cursorY);
    cursorY += descLines.length * 4 + 4;
  }

  // 5. Étapes Réalisées
  if (report.steps && report.steps.length > 0) {
    checkPageBreak(25);
    doc.setFillColor(243, 244, 246);
    doc.rect(margin, cursorY, contentWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(31, 41, 55);
    doc.text('CHRONOLOGIE DES TRAVAUX / ÉTAPES RÉALISÉES', margin + 3, cursorY + 4.2);
    cursorY += 8;

    report.steps.forEach((step, idx) => {
      checkPageBreak(12);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text(`${idx + 1}. ${step.title} (${step.durationMinutes} min)`, margin + 4, cursorY);
      doc.setFont('helvetica', 'normal');
      const stepDesc = doc.splitTextToSize(step.description, contentWidth - 10);
      doc.text(stepDesc, margin + 6, cursorY + 4);
      cursorY += stepDesc.length * 3.8 + 4;
    });
  }

  // 6. Tableau de Tests & Contrôles
  if (report.testsAndControls && report.testsAndControls.length > 0) {
    checkPageBreak(25);
    doc.setFillColor(243, 244, 246);
    doc.rect(margin, cursorY, contentWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(31, 41, 55);
    doc.text('TABLEAU DES ESSAIS, MESURES ET CONTRÔLES QUALITÉ', margin + 3, cursorY + 4.2);
    cursorY += 8;

    report.testsAndControls.forEach((t) => {
      checkPageBreak(8);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text(`• ${t.name} :`, margin + 4, cursorY);
      doc.setFont('helvetica', 'normal');
      doc.text(`Mesuré: ${t.measuredValue} ${t.unit} (Attendu: ${t.expectedValue}) • Résultat: [${t.status}]`, margin + 50, cursorY);
      cursorY += 5;
    });
    cursorY += 3;
  }

  // 7. Évaluation Enseignant & Signature
  checkPageBreak(35);
  doc.setFillColor(243, 244, 246);
  doc.rect(margin, cursorY, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(31, 41, 55);
  doc.text('ÉVALUATION PÉDAGOGIQUE & VISA DE L’ENSEIGNANT', margin + 3, cursorY + 4.2);
  cursorY += 8;

  if (report.evaluations && report.evaluations.length > 0) {
    const latestEval = report.evaluations[0];
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(`Note Officielle : ${latestEval.scoreOn20} / 20 • Évaluateur : ${latestEval.teacherName}`, margin + 4, cursorY);
    cursorY += 5;

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    if (latestEval.generalFeedback) {
      const fb = doc.splitTextToSize(`Appréciation : ${latestEval.generalFeedback}`, contentWidth - 10);
      doc.text(fb, margin + 4, cursorY);
      cursorY += fb.length * 3.8 + 4;
    }
  }

  // Cartouche de signatures
  checkPageBreak(25);
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, cursorY, contentWidth / 2 - 2, 20);
  doc.rect(margin + contentWidth / 2 + 2, cursorY, contentWidth / 2 - 2, 20);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('Signature de l’Apprenant :', margin + 3, cursorY + 4);
  doc.text('Visa & Cachet du Formateur Référent :', margin + contentWidth / 2 + 5, cursorY + 4);

  // Sauvegarde / Téléchargement du PDF
  const safeFilename = `Rapport_Professionnel_${report.specialtyCode}_${report.studentMatricule}.pdf`;
  doc.save(safeFilename);
}
