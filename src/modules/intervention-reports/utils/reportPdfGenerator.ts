import jsPDF from 'jspdf';
import { InterventionReportAggregate } from '../types/report.types';

export function generateInterventionReportPDF(aggregate: InterventionReportAggregate): void {
  const { report, steps, materials, tools, difficulties, tests, competencies, attachments, evaluations } = aggregate;

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
    doc.setFontSize(38);
    doc.setFont('helvetica', 'bold');
    doc.text('CFP-ITMC DOUALA', 105, 140, { align: 'center', angle: 25 });
  };

  drawHeaderWatermark();

  // 1. En-tête Officiel CFP-ITMC
  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(margin, cursorY, contentWidth, 24, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('CFP-ITMC DOUALA • RAPPORT D’INTERVENTION TECHNIQUE', margin + 6, cursorY + 8);

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
  doc.text(`Année : ${report.academicYear} • Rév. #${report.currentRevision}`, pageWidth - margin - 6, cursorY + 17, { align: 'right' });

  cursorY += 28;

  // Titre & Statut
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, cursorY, contentWidth, 16, 2, 2, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(doc.splitTextToSize(`OBJET : ${report.title}`, contentWidth - 45), margin + 4, cursorY + 6);

  // Badge Statut
  const statusLabels: Record<string, string> = {
    DRAFT: 'BROUILLON',
    SUBMITTED: 'SOUMIS',
    UNDER_REVIEW: 'EN COURS',
    CHANGES_REQUESTED: 'CORRECTIONS',
    RESUBMITTED: 'RESOUMIS',
    APPROVED: 'VALIDÉ & APPROUVÉ',
    ARCHIVED: 'ARCHIVÉ',
  };
  doc.setFillColor(30, 58, 138);
  doc.roundedRect(pageWidth - margin - 38, cursorY + 3.5, 34, 9, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text(statusLabels[report.status] || report.status, pageWidth - margin - 21, cursorY + 9, { align: 'center' });

  cursorY += 20;

  // 2. Grille Informations Étudiant & Fiche d'Intervention
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, cursorY, contentWidth, 32, 1.5, 1.5, 'FD');

  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);

  const col1 = margin + 4;
  const col2 = margin + 95;

  doc.setFont('helvetica', 'bold');
  doc.text('1. APPRENANT & PÉDAGOGIE', col1, cursorY + 5);
  doc.text('2. CADRE DE L’INTERVENTION', col2, cursorY + 5);

  doc.setFont('helvetica', 'normal');
  doc.text(`Nom : ${report.studentName}`, col1, cursorY + 11);
  doc.text(`Matricule : ${report.studentMatricule}`, col1, cursorY + 16);
  doc.text(`Spécialité : ${report.specialtyName} (${report.classCode})`, col1, cursorY + 21);
  doc.text(`Enseignant Référent : ${report.assignedTeacherName}`, col1, cursorY + 26);

  doc.text(`Date & Horaires : ${report.interventionDate} (${report.startTime || '08:00'} - ${report.endTime || '12:00'} • ${report.durationHours}h)`, col2, cursorY + 11);
  doc.text(`Type : ${report.interventionType}`, col2, cursorY + 16);
  doc.text(`Client / Poste : ${report.clientOrSite || 'CFP-ITMC'} ${report.clientPhone ? `(${report.clientPhone})` : ''}`, col2, cursorY + 21);
  doc.text(`Lieu : ${report.location}`, col2, cursorY + 26);

  cursorY += 36;

  // 3. Contexte, Problème & Objectifs
  checkPageBreak(25);
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, cursorY, contentWidth, 5, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('3. CONTEXTE INITIAL, PROBLÈME CONSTATÉ & OBJECTIFS', margin + 3, cursorY + 3.8);
  cursorY += 7;

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  if (report.problemObserved) {
    doc.text(`• Symptôme / Problème constaté : ${report.problemObserved}`, margin + 2, cursorY);
    cursorY += 5;
  }
  const objLines = doc.splitTextToSize(`• Objectif & Cahier des charges : ${report.contextAndObjective || 'RAS'}`, contentWidth - 4);
  doc.text(objLines, margin + 2, cursorY);
  cursorY += objLines.length * 4 + 4;

  // 4. Chronologie des Étapes Réalisées
  if (steps.length > 0) {
    checkPageBreak(30);
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, cursorY, contentWidth, 5, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('4. TRAVAUX ÉTAPE PAR ÉTAPE (CHRONOLOGIE TECHNIQUE)', margin + 3, cursorY + 3.8);
    cursorY += 7;

    steps.forEach((st, idx) => {
      checkPageBreak(12);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 58, 138);
      doc.text(`Étape ${st.stepOrder || idx + 1} [${st.phase}] : ${st.title} (${st.durationMinutes} min)`, margin + 2, cursorY);
      cursorY += 4;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const descLines = doc.splitTextToSize(st.description, contentWidth - 6);
      doc.text(descLines, margin + 4, cursorY);
      cursorY += descLines.length * 3.8 + 2;
    });
    cursorY += 2;
  }

  // 5. Matériels & Outillage
  if (materials.length > 0 || tools.length > 0) {
    checkPageBreak(25);
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, cursorY, contentWidth, 5, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('5. MATÉRIELS, COMPOSANTS & INSTRUMENTS DE MESURE', margin + 3, cursorY + 3.8);
    cursorY += 7;

    if (materials.length > 0) {
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('Matériels :', margin + 2, cursorY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const matStr = materials.map((m) => `${m.name} (Qté: ${m.quantity} ${m.unit}${m.reference ? `, Réf: ${m.reference}` : ''})`).join(' • ');
      const matLines = doc.splitTextToSize(matStr, contentWidth - 20);
      doc.text(matLines, margin + 18, cursorY);
      cursorY += matLines.length * 3.8 + 2;
    }

    if (tools.length > 0) {
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('Outillage :', margin + 2, cursorY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const toolStr = tools.map((t) => `${t.name} [${t.category}] (${t.calibrationStatus || 'Opérationnel'})`).join(' • ');
      const toolLines = doc.splitTextToSize(toolStr, contentWidth - 20);
      doc.text(toolLines, margin + 18, cursorY);
      cursorY += toolLines.length * 3.8 + 3;
    }
  }

  // 6. Sécurité & Tests de Conformité
  checkPageBreak(28);
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, cursorY, contentWidth, 5, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('6. SÉCURITÉ APPLIQUÉE & CONTRÔLES / TESTS DE CONFORMITÉ', margin + 3, cursorY + 3.8);
  cursorY += 7;

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Mesures de sécurité : ${report.safetyMeasures || 'Port des EPI réglementaires et consignation du poste.'}`, margin + 2, cursorY);
  cursorY += 5;

  if (tests.length > 0) {
    tests.forEach((t) => {
      checkPageBreak(8);
      doc.setFont('helvetica', 'bold');
      doc.text(`• Test : ${t.testName}`, margin + 2, cursorY);
      doc.setFont('helvetica', 'normal');
      doc.text(`(Mesuré : ${t.measuredValue} ${t.unit} | Attendu : ${t.expectedValue}) -> [${t.result}]`, margin + 65, cursorY);
      cursorY += 4.5;
    });
  }
  cursorY += 2;

  // 7. Compétences & Auto-évaluation
  checkPageBreak(25);
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, cursorY, contentWidth, 5, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('7. COMPÉTENCES MOBILISÉES & BILAN APPRENANT', margin + 3, cursorY + 3.8);
  cursorY += 7;

  if (competencies.length > 0) {
    const compText = competencies.map((c) => `[${c.code}] ${c.label} (${c.selfLevel})`).join(' • ');
    const compLines = doc.splitTextToSize(`Compétences : ${compText}`, contentWidth - 4);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(compLines, margin + 2, cursorY);
    cursorY += compLines.length * 3.8 + 2;
  }

  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);
  if (report.selfEvaluation) {
    doc.text(`Auto-évaluation apprenant : Autonomie ${report.selfEvaluation.autonomyScore || 4}/5 • Maîtrise ${report.selfEvaluation.technicalMasteryScore || 4}/5 • Sécurité ${report.selfEvaluation.safetyComplianceScore || 5}/5`, margin + 2, cursorY);
    cursorY += 4;
    if (report.selfEvaluation.learned) {
      doc.text(`Ce que j'ai appris : ${report.selfEvaluation.learned}`, margin + 2, cursorY);
      cursorY += 4;
    }
  }

  // 8. Évaluation & Validation Enseignant
  checkPageBreak(30);
  doc.setFillColor(238, 242, 255); // indigo-50
  doc.setDrawColor(199, 210, 254);
  doc.roundedRect(margin, cursorY, contentWidth, 26, 2, 2, 'FD');

  const latestEval = evaluations[0];
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text(`8. ÉVALUATION PÉDAGOGIQUE • ${report.assignedTeacherName}`, margin + 4, cursorY + 6);

  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(
    `NOTE : ${report.latestScoreOn20 !== null ? `${report.latestScoreOn20}/20` : 'En attente de notation'}`,
    pageWidth - margin - 6,
    cursorY + 6,
    { align: 'right' }
  );

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const evalFeedback = latestEval?.generalFeedback || 'Rapport conforme aux exigences du référentiel de formation professionnelle.';
  const evalLines = doc.splitTextToSize(`Appréciation : ${evalFeedback}`, contentWidth - 8);
  doc.text(evalLines, margin + 4, cursorY + 12);

  cursorY += 32;

  // 9. Signatures & Cachet
  checkPageBreak(25);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Signature de l’Apprenant', margin + 15, cursorY);
  doc.text('Visa & Cachet de l’Enseignant Évaluateur', pageWidth - margin - 75, cursorY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Signé électroniquement par ${report.studentName}`, margin + 15, cursorY + 5);
  doc.text(`Certifié par ${report.assignedTeacherName} • CFP-ITMC Douala`, pageWidth - margin - 75, cursorY + 5);

  doc.setDrawColor(203, 213, 225);
  doc.rect(margin + 10, cursorY + 8, 55, 15);
  doc.rect(pageWidth - margin - 80, cursorY + 8, 70, 15);

  doc.save(`${report.reportNumber}_CFP_ITMC.pdf`);
}
