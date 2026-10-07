import { defaultSpecialties, FILIERES } from "@/data/specialtiesData";
import {
  getModuleAppreciation,
  getMentionAndGeneralAppreciation
} from "@/components/OfficialTranscriptModal";

export interface StudentGrade {
  studentId: string;
  studentName: string;
  promo: string;
  classCode?: string;
  email: string;
  score: number;
  comments?: string;
}

export interface Composition {
  id: string;
  title: string;
  type: 'CC' | 'TD' | 'Composition Normale' | 'Rattrapage';
  promo: string;
  classCode: string;
  department: string;
  level: string;
  subject: string;
  teacherId?: string;
  teacherName: string;
  coefficient: number;
  maxScore: number;
  date: string;
  status: 'Ouverte' | 'Clôturée';
  isPublished?: boolean;
  grades: StudentGrade[];
  academicYear: string;
  normaleId?: string;
}

export const CATEGORIES_FILIERES = [
  { id: 'all', name: 'Toutes les Filières (4 Pôles)', shortName: 'Toutes Catégories', icon: '🎓', filiereLabel: 'Toutes' },
  { id: 'batiment', name: 'Bâtiment, Construction & Travaux (BTP)', shortName: 'Bâtiment & Travaux (BTP)', icon: '🏗️', filiereLabel: FILIERES.BATIMENT.name },
  { id: 'industrie', name: 'Industrie, Mécanique & Énergie', shortName: 'Industrie & Énergie', icon: '⚙️', filiereLabel: FILIERES.INDUSTRIE.name },
  { id: 'informatique', name: 'Informatique, Digital & Communication', shortName: 'Informatique & Digital', icon: '💻', filiereLabel: FILIERES.INFORMATIQUE.name },
  { id: 'administration', name: 'Administration, Commerce & Gestion', shortName: 'Gestion & Commerce', icon: '💼', filiereLabel: FILIERES.ADMINISTRATION.name }
];

// Map each of the 35 official specialties to its category id and default classCode
export function getCategoryIdForFiliereString(str: string): 'batiment' | 'industrie' | 'informatique' | 'administration' {
  const s = (str || '').toLowerCase();
  if (
    s.includes('bâtiment') || s.includes('batiment') || s.includes('btp') || s.includes('construction') ||
    s.includes('tuyaut') || s.includes('carrel') || s.includes('coffreur') || s.includes('ferraill') ||
    s.includes('pavé') || s.includes('pave') || s.includes('staff') || s.includes('étanch') ||
    s.includes('etanch') || s.includes('peinture') || s.includes('métallerie') || s.includes('metallerie') ||
    s.includes('soudure') || s.includes('maçon') || s.includes('macon') || s.includes('vitrerie') ||
    s.includes('aluminium') || s.includes('plomberie') || s.startsWith('b1') || s.startsWith('b2')
  ) {
    return 'batiment';
  }
  if (
    s.includes('industrie') || s.includes('mécanique') || s.includes('mecanique') || s.includes('mécatronique') ||
    s.includes('mecatronique') || s.includes('énergie') || s.includes('energie') || s.includes('solaire') ||
    s.includes('électrotechnique') || s.includes('electrotechnique') || s.includes('froid') || s.includes('climatisation') ||
    s.includes('chariot') || s.includes('manutention') || s.includes('qualité') || s.includes('qualite') ||
    s.includes('informatique industrielle') || s.startsWith('i1') || s.startsWith('i2')
  ) {
    return 'industrie';
  }
  if (
    s.includes('administration') || s.includes('commerce') || s.includes('gestion') || s.includes('comptab') ||
    s.includes('caissier') || s.includes('direction') || s.includes('télévendeur') || s.includes('televendeur') ||
    s.includes('secrétariat') || s.includes('secretariat') || s.includes('bureautique') ||
    s.includes('douane') || s.includes('transit') || s.includes('logistique') || s.includes('banque') ||
    s.includes('rh') || s.startsWith('c1') || s.startsWith('c2')
  ) {
    return 'administration';
  }
  return 'informatique';
}

export function doesSpecialtyMatchStudentOrClass(
  selectedSpecialty: string,
  targetSpecialtyOrFilieres: string | string[],
  classCode?: string
): boolean {
  if (!selectedSpecialty || selectedSpecialty === 'all') return true;
  const sel = selectedSpecialty.toLowerCase().trim();
  const list = Array.isArray(targetSpecialtyOrFilieres)
    ? targetSpecialtyOrFilieres
    : [targetSpecialtyOrFilieres];

  for (const item of list) {
    if (!item) continue;
    const it = item.toLowerCase().trim();
    if (it === sel || it.includes(sel) || sel.includes(it)) return true;
    // Handle synonyms between system data and 35 official specialties
    if ((sel.includes('logiciel') || sel.includes('conception')) && (it.includes('logiciel') || it.includes('conception'))) return true;
    if ((sel.includes('réseau') || sel.includes('télécom') || sel.includes('intrusion') || sel.includes('cyber') || sel.includes('télésurveillance')) &&
        (it.includes('réseau') || it.includes('télécom') || it.includes('cyber') || it.includes('intrusion') || it.includes('télésurveillance'))) return true;
    if ((sel.includes('infographie') || sel.includes('graphisme') || sel.includes('design')) &&
        (it.includes('infographie') || it.includes('graphisme') || it.includes('design'))) return true;
    if ((sel.includes('comptab') || sel.includes('caissier') || sel.includes('secrétariat') || sel.includes('direction') || sel.includes('télévendeur') || sel.includes('marketing')) &&
        (it.includes('comptab') || it.includes('marketing') || it.includes('gestion') || it.includes('secrétariat') || it.includes('caissier'))) return true;
  }

  if (classCode) {
    const cc = classCode.toLowerCase();
    if ((sel.includes('logiciel') || sel.includes('conception')) && cc.includes('gl')) return true;
    if ((sel.includes('réseau') || sel.includes('cyber') || sel.includes('télécom') || sel.includes('intrusion') || sel.includes('télésurveillance')) && cc.includes('rcs')) return true;
    if ((sel.includes('infographie') || sel.includes('graphisme') || sel.includes('design')) && cc.includes('des')) return true;
    if ((sel.includes('comptab') || sel.includes('marketing') || sel.includes('secrétariat') || sel.includes('caissier') || sel.includes('direction') || sel.includes('télévendeur')) && cc.includes('cmd')) return true;
    if (getCategoryIdForFiliereString(sel) === 'batiment' && cc.includes('btp')) return true;
    if (getCategoryIdForFiliereString(sel) === 'industrie' && cc.includes('ind')) return true;
  }

  return false;
}

export function getStudentBulletinData(
  student: any,
  sessionId: string,
  compositions: Composition[],
  normalesList: any[],
  students: any[]
) {
  if (!student) {
    return {
      moduleRows: [],
      totalCoefficients: 0,
      overallAverage: 0,
      rankLabel: '1 / 1',
      generalAppreciation: '',
      mentionLabel: '',
      sessionTitle: "Bulletin d'Évaluations",
      sessionShort: 'Éval.'
    };
  }

  const studentPromo = (student.promo || '').toLowerCase();
  const studentClassCode = (student.classCode || '').toLowerCase();

  const relevantNormales = normalesList.filter(n => {
    if (!n.promo || n.promo === 'Tous' || n.promo === 'Toutes') return true;
    const np = (n.promo || '').toLowerCase();
    return (
      np === studentPromo ||
      np === studentClassCode ||
      studentClassCode.startsWith(np) ||
      np.startsWith(studentPromo)
    );
  });

  const activeNormal = normalesList.find(n => n.id === sessionId) || relevantNormales.find(n => n.id === sessionId);

  const studentComps = compositions.filter(c => {
    const hasGrade = Array.isArray(c.grades) && c.grades.some((g: any) => g.studentId === student.id);
    const compClass = (c.classCode || '').toLowerCase();
    const compPromo = (c.promo || '').toLowerCase();
    const matchesClass =
      (compClass && compClass === studentClassCode) ||
      (compPromo && (compPromo === studentPromo || compPromo === studentClassCode));
    return hasGrade || matchesClass;
  });

  let activeCompositions: Composition[] = [];
  let sessionTitle = "Bulletin Général d'Évaluations";
  let sessionShort = "Général";

  if (sessionId === 'all') {
    activeCompositions = studentComps;
    sessionTitle = "Bulletin Général d'Évaluations";
    sessionShort = "Général";
  } else if (sessionId === 'annual') {
    activeCompositions = studentComps;
    sessionTitle = "Bulletin de Synthèse Annuelle";
    sessionShort = "Annuel";
  } else if (activeNormal) {
    sessionTitle = `${activeNormal.title} (${activeNormal.semester || 'Session'})`;
    sessionShort = activeNormal.semester || activeNormal.code || "Session";
    const linked = studentComps.filter(
      c => c.normaleId === sessionId || (Array.isArray(activeNormal.compositionIds) && activeNormal.compositionIds.includes(c.id))
    );
    activeCompositions = linked.length > 0 ? linked : studentComps;
  } else {
    activeCompositions = studentComps;
  }

  const rows: any[] = [];
  const groupedMap = new Map<string, { totalWeighted: number; totalCoeff: number; maxCoeff: number; comments: string[] }>();

  activeCompositions.forEach(comp => {
    const modName = (comp.subject || comp.title || 'Module Professionnel').trim();
    const gradeRecord = comp.grades?.find((g: any) => g.studentId === student.id);

    if (gradeRecord && typeof gradeRecord.score === 'number') {
      const rawScore = gradeRecord.score;
      const max = comp.maxScore || 20;
      const coeff = Number(comp.coefficient) || 1;
      const normalized20 = max > 0 ? (rawScore / max) * 20 : 0;

      const existing = groupedMap.get(modName) || {
        totalWeighted: 0,
        totalCoeff: 0,
        maxCoeff: 0,
        comments: []
      };
      existing.totalWeighted += normalized20 * coeff;
      existing.totalCoeff += coeff;
      existing.maxCoeff = Math.max(existing.maxCoeff, coeff);
      if (gradeRecord.comments) existing.comments.push(gradeRecord.comments);
      groupedMap.set(modName, existing);
    }
  });

  let idx = 1;
  groupedMap.forEach((val, modName) => {
    const avg20 = val.totalCoeff > 0 ? val.totalWeighted / val.totalCoeff : 0;
    rows.push({
      num: idx++,
      moduleName: modName,
      coeff: val.totalCoeff,
      note20: avg20,
      appreciation: getModuleAppreciation(avg20, val.comments[0])
    });
  });

  if (rows.length === 0) {
    const specName = (student.specialty || '').toLowerCase();
    const matchedSpec = defaultSpecialties.find(
      s => s.name.toLowerCase() === specName || specName.includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(specName)
    ) || defaultSpecialties[0];

    const specModules = matchedSpec?.modules && matchedSpec.modules.length > 0
      ? matchedSpec.modules
      : [
          "Algorithmique et Programmation",
          "Base de Données et Modélisation SQL",
          "Réseaux Informatiques et Télécoms",
          "Systèmes d'Exploitation (Linux / Windows)",
          "Développement Web et Applications"
        ];

    const baseScore = student.lastGrade ? parseFloat(String(student.lastGrade)) : 14.5;
    const defaultCoeffs = [4, 4, 3, 3, 3, 2];

    specModules.slice(0, 6).forEach((modTitle: string, i: number) => {
      const cleanTitle = modTitle.replace(/^Module\s*\d+\s*:\s*/i, '').trim();
      const coeff = defaultCoeffs[i % defaultCoeffs.length];
      rows.push({
        num: rows.length + 1,
        moduleName: cleanTitle,
        coeff,
        note20: baseScore,
        appreciation: getModuleAppreciation(baseScore)
      });
    });
  }

  const totalCoeff = rows.reduce((sum, r) => sum + r.coeff, 0);
  const totalPoints = rows.reduce((sum, r) => sum + r.note20 * r.coeff, 0);
  const avg = totalCoeff > 0 ? totalPoints / totalCoeff : (student.lastGrade ? parseFloat(String(student.lastGrade)) : 14.5);

  const peers = students.filter(s => {
    if (studentClassCode && (s.classCode || '').toLowerCase() === studentClassCode) return true;
    if (studentPromo && (s.promo || '').toLowerCase() === studentPromo) return true;
    return false;
  });

  const totalPeersCount = Math.max(peers.length, 1);
  const peerAverages = peers.map(peer => {
    if (peer.id === student.id) return { id: peer.id, avg };
    const peerComps = compositions.filter(
      c => Array.isArray(c.grades) && c.grades.some((g: any) => g.studentId === peer.id)
    );
    if (peerComps.length > 0) {
      let pWeighted = 0;
      let pCoeff = 0;
      peerComps.forEach(c => {
        const g = c.grades.find((gr: any) => gr.studentId === peer.id);
        if (g && typeof g.score === 'number') {
          const sc = (g.score / (c.maxScore || 20)) * 20;
          const cf = Number(c.coefficient) || 1;
          pWeighted += sc * cf;
          pCoeff += cf;
        }
      });
      return { id: peer.id, avg: pCoeff > 0 ? pWeighted / pCoeff : (peer.lastGrade ? parseFloat(String(peer.lastGrade)) : 12) };
    }
    const fallbackAvg = peer.lastGrade ? parseFloat(String(peer.lastGrade)) : 12;
    return { id: peer.id, avg: fallbackAvg };
  });

  if (!peerAverages.some(p => p.id === student.id)) {
    peerAverages.push({ id: student.id, avg });
  }
  peerAverages.sort((a, b) => b.avg - a.avg);
  const rankIndex = peerAverages.findIndex(p => p.id === student.id);
  const rankPos = rankIndex !== -1 ? rankIndex + 1 : 1;
  const rankStr = `${rankPos} / ${Math.max(peerAverages.length, totalPeersCount)}`;

  const { mention, generalAppreciation } = getMentionAndGeneralAppreciation(avg);

  return {
    moduleRows: rows,
    totalCoefficients: totalCoeff,
    overallAverage: avg,
    rankLabel: rankStr,
    generalAppreciation,
    mentionLabel: mention,
    sessionTitle,
    sessionShort
  };
}

export const BULLETIN_PRINT_SCOPED_CSS = `
  .itmc-bulletin-page {
    --navy: #0b2a63;
    --blue: #2f6fd0;
    --light: #b9d0ee;
    --tint: #f2f7fd;
    --red: #d4202c;
    --ink: #1c2740;
    --muted: #5a6785;
    position: relative;
    width: 210mm !important;
    height: 297mm !important;
    min-height: 297mm !important;
    max-height: 297mm !important;
    margin: 0 auto !important;
    background: #ffffff;
    color: var(--ink);
    font-family: "Segoe UI", Arial, sans-serif;
    overflow: hidden;
    padding: 0 14mm 8mm !important;
    box-sizing: border-box;
    text-align: left;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    page-break-after: always !important;
    break-after: page !important;
  }
  .itmc-bulletin-page * { box-sizing: border-box; }
  .itmc-bulletin-page .curve { position: absolute; pointer-events: none; z-index: 0; }
  .itmc-bulletin-page .tl { top: 0; left: 0; width: 34mm; height: 24mm; }
  .itmc-bulletin-page .tr { top: 0; right: 0; width: 34mm; height: 24mm; }
  .itmc-bulletin-page .bl { bottom: 0; left: 0; width: 36mm; height: 16mm; }
  .itmc-bulletin-page .br { bottom: 0; right: 0; width: 36mm; height: 16mm; }
  .itmc-bulletin-page .content { position: relative; z-index: 1; flex: 1; display: flex; flex-direction: column; }
  .itmc-bulletin-page .head { display: grid; grid-template-columns: 36mm 1fr 44mm; gap: 0 5mm; align-items: center; padding: 6mm 0 2.5mm; border-bottom: 0.4mm solid var(--light); }
  .itmc-bulletin-page .head-brand { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 1.2mm; }
  .itmc-bulletin-page .brand-logo { width: 20mm; height: 20mm; border-radius: 50%; border: 1.1mm solid var(--navy); display: flex; align-items: center; justify-content: center; font: 800 3.2mm "Segoe UI", sans-serif; color: var(--navy); background: #fff; overflow: hidden; }
  .itmc-bulletin-page .brand-logo img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
  .itmc-bulletin-page .brand-name { margin: 0; font: 800 4.2mm Georgia, serif; letter-spacing: 0.4mm; color: var(--navy); }
  .itmc-bulletin-page .brand-motto { margin: 0; font: italic 2.3mm Georgia, serif; color: var(--blue); }
  .itmc-bulletin-page .head-admin { text-align: center; font-size: 2.8mm; line-height: 1.32; color: var(--muted); }
  .itmc-bulletin-page .head-admin .country { display: block; font-size: 3.3mm; font-weight: 800; color: var(--navy); }
  .itmc-bulletin-page .head-admin .motto { display: block; font-size: 1.8mm; font-weight: 700; margin-top: 0.5mm; text-transform: uppercase; }
  .itmc-bulletin-page .student-card { display: grid; grid-template-columns: 1fr 1fr; gap: 3mm 8mm; margin-top: 3.5mm; background: var(--tint); border: 0.4mm solid var(--light); border-radius: 4mm; padding: 3mm 4.5mm; font-size: 3mm; }
  .itmc-bulletin-page .student-card .field { display: flex; justify-content: space-between; align-items: center; }
  .itmc-bulletin-page .student-card .field span { color: var(--muted); font-weight: 600; }
  .itmc-bulletin-page .student-card .field b { color: var(--navy); font-weight: 800; }
  .itmc-bulletin-page .bulletin-title { font-size: 4.8mm; font-weight: 900; color: var(--navy); text-align: center; margin: 3.2mm 0; letter-spacing: 0.5mm; text-transform: uppercase; border-bottom: 0.5mm solid var(--navy); padding-bottom: 1.2mm; }
  .itmc-bulletin-page .table-wrap { margin-top: 2mm; margin-bottom: 2mm; width: 100%; border: 0.4mm solid var(--navy); border-radius: 3mm; overflow: hidden; }
  .itmc-bulletin-page table { width: 100%; border-collapse: collapse; font-size: 2.9mm; }
  .itmc-bulletin-page th { background: var(--navy); color: #fff; font-weight: 800; text-transform: uppercase; font-size: 2.65mm; padding: 1.8mm 2mm; border: 0.2mm solid var(--navy); text-align: left; }
  .itmc-bulletin-page td { padding: 1.8mm 2mm; border: 0.2mm solid var(--light); color: var(--ink); }
  .itmc-bulletin-page tr:nth-child(even) { background: var(--tint); }
  .itmc-bulletin-page .text-center { text-align: center; }
  .itmc-bulletin-page .font-bold { font-weight: 800; }
  .itmc-bulletin-page .summary-grid { display: grid; grid-template-columns: 2fr 1.8fr; gap: 4mm; margin-top: 3mm; }
  .itmc-bulletin-page .box { border: 0.4mm solid var(--navy); border-radius: 4mm; background: #fff; padding: 2.2mm 3.2mm; font-size: 2.95mm; line-height: 1.4; display: flex; flex-direction: column; }
  .itmc-bulletin-page .box h3 { margin: 0 0 1.2mm; font-size: 3.15mm; font-weight: 800; color: var(--navy); text-transform: uppercase; }
  .itmc-bulletin-page .box .line { display: flex; justify-content: space-between; align-items: center; gap: 2mm; }
  .itmc-bulletin-page .box .line b { color: var(--navy); font-weight: 800; }
  .itmc-bulletin-page .mention { display: flex; align-items: flex-end; justify-content: space-between; gap: 5mm; margin-top: 3.8mm; margin-bottom: 2mm; }
  .itmc-bulletin-page .mb { display: inline-block; background: var(--navy); color: #fff; font-weight: 800; font-size: 5mm; padding: 2.4mm 9.5mm; border-radius: 5mm; letter-spacing: 0.6mm; text-transform: uppercase; }
  .itmc-bulletin-page .sig { text-align: center; font-size: 2.95mm; width: 68mm; }
  .itmc-bulletin-page .sig .role { font-weight: 700; color: var(--navy); }
  .itmc-bulletin-page .sig .s { font: italic 8mm "Brush Script MT", sans-serif; color: var(--blue); height: 10mm; display: flex; align-items: center; justify-content: center; }
  .itmc-bulletin-page .foot { position: relative; z-index: 2; margin-top: auto; padding-top: 2mm; padding-bottom: 1mm; font-size: 2.7mm; color: var(--muted); text-align: center; width: 100%; }
  .itmc-bulletin-page . watermark { position: absolute; top: 52%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); opacity: 0.05; pointer-events: none; z-index: 0; text-align: center; width: 100%; }
  @page { size: A4 portrait; margin: 0; }
  html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
`;
