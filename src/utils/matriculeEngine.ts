/**
 * MINEFOP Official Matricule Generation & Management Engine (Cameroon Vocational Training Standards)
 * CFP-ITMC Douala (Centre de Formation Professionnelle aux Métiers des Technologies & du Management)
 *
 * Official Matricule Format:
 * [NUMERO_FILIERE][SIGLE_INSTITUT][ANNEE_SESSION][CODE_SPECIALITE][NUMERO_ORDRE_ALPHABETIQUE]
 * Example: 1itmc26gl001 or 21ITMC26GL001
 * - 1 or 21: Specialty index among the 35 specialties
 * - itmc: Institute acronym
 * - 26: 2-digit session year (from 2026-2027)
 * - gl: Specialty short code (Génie Logiciel)
 * - 001: 3-digit sequential index ordered alphabetically by student surname/name (A -> Z)
 */

export interface SpecialtyMatriculeDef {
  index: number;
  id: string;
  name: string;
  code: string;
  filiere: string;
}

export const SPECIALTY_MATRICULE_REGISTRY: SpecialtyMatriculeDef[] = [
  { index: 1, id: "tuyauterie", name: "Tuyauterie", code: "TUY", filiere: "BTP & Construction" },
  { index: 2, id: "carrelage-batiment", name: "Carrelage – Bâtiment", code: "CAR", filiere: "BTP & Construction" },
  { index: 3, id: "coffreur-ferrailleur", name: "Coffreur / Ferrailleur", code: "CF", filiere: "BTP & Construction" },
  { index: 4, id: "poseur-de-paves", name: "Poseur de Pavés", code: "PAV", filiere: "BTP & Construction" },
  { index: 5, id: "staff-et-decoration", name: "Staff et Décoration", code: "STF", filiere: "BTP & Construction" },
  { index: 6, id: "etancheite", name: "Étanchéité", code: "ETA", filiere: "BTP & Construction" },
  { index: 7, id: "peinture-batiment", name: "Peinture Bâtiment", code: "PNT", filiere: "BTP & Construction" },
  { index: 8, id: "metallerie-soudure-tuyauterie", name: "Métallerie-Soudure-Tuyauterie", code: "MST", filiere: "BTP & Construction" },
  { index: 9, id: "maconnerie-gros-oeuvre", name: "Maçonnerie Gros Œuvre", code: "MAC", filiere: "BTP & Construction" },
  { index: 10, id: "vitrerie-aluminium", name: "Vitrerie Aluminium", code: "ALU", filiere: "BTP & Construction" },
  { index: 11, id: "plomberie", name: "Plomberie", code: "PLM", filiere: "BTP & Construction" },
  { index: 12, id: "conduite-chariots-elevateurs", name: "Conduite des Chariots Élévateurs et Manutentions", code: "CCE", filiere: "Industrie & Énergie" },
  { index: 13, id: "mecatronique-automobile", name: "Mécatronique Automobile", code: "MEC", filiere: "Industrie & Énergie" },
  { index: 14, id: "mecanique-automobile", name: "Mécanique Automobile", code: "MCA", filiere: "Industrie & Énergie" },
  { index: 15, id: "energie-renouvelable", name: "Énergie Renouvelable", code: "ENR", filiere: "Industrie & Énergie" },
  { index: 16, id: "maintenance-systemes-solaires", name: "Maintenance des Systèmes Solaires", code: "MSS", filiere: "Industrie & Énergie" },
  { index: 17, id: "electrotechnique", name: "Électrotechnique", code: "ELT", filiere: "Industrie & Énergie" },
  { index: 18, id: "froid-et-climatisation", name: "Froid et Climatisation", code: "FCL", filiere: "Industrie & Énergie" },
  { index: 19, id: "electronique", name: "Électronique", code: "ELN", filiere: "Industrie & Énergie" },
  { index: 20, id: "maintenance-industrielle", name: "Maintenance Industrielle", code: "MIN", filiere: "Industrie & Énergie" },
  { index: 21, id: "genie-logiciel", name: "Génie Logiciel", code: "GL", filiere: "Informatique & Digital" },
  { index: 22, id: "reseaux-et-telecoms", name: "Réseaux & Télécoms", code: "RT", filiere: "Informatique & Digital" },
  { index: 23, id: "cyber-securite", name: "Cyber-sécurité", code: "CS", filiere: "Informatique & Digital" },
  { index: 24, id: "ia-et-big-data", name: "Intelligence Artificielle & Big Data", code: "IA", filiere: "Informatique & Digital" },
  { index: 25, id: "maintenance-informatique", name: "Maintenance Informatique", code: "MNT", filiere: "Informatique & Digital" },
  { index: 26, id: "infographie-et-design", name: "Infographie & Design 2D/3D", code: "INF", filiere: "Informatique & Digital" },
  { index: 27, id: "marketing-digital", name: "Marketing Digital & Community Management", code: "MD", filiere: "Informatique & Digital" },
  { index: 28, id: "secretariat-bureautique", name: "Secrétariat Bureautique", code: "SB", filiere: "Informatique & Digital" },
  { index: 29, id: "comptabilite-gestion", name: "Comptabilité & Gestion des Entreprises", code: "CG", filiere: "Gestion & Commerce" },
  { index: 30, id: "gestion-rh", name: "Gestion des Ressources Humaines", code: "GRH", filiere: "Gestion & Commerce" },
  { index: 31, id: "douane-et-transit", name: "Douane & Transit", code: "DT", filiere: "Gestion & Commerce" },
  { index: 32, id: "logistique-et-transport", name: "Logistique & Transport", code: "LT", filiere: "Gestion & Commerce" },
  { index: 33, id: "banque-et-microfinance", name: "Banque & Microfinance", code: "BM", filiere: "Gestion & Commerce" },
  { index: 34, id: "commerce-international", name: "Commerce International", code: "CI", filiere: "Gestion & Commerce" },
  { index: 35, id: "gestion-de-projets", name: "Gestion de Projets", code: "GP", filiere: "Gestion & Commerce" }
];

/**
 * Extract 2-digit academic session year
 * Examples: "2026-2027" -> "26", "2027-2028" -> "27", "2025-2026" -> "25"
 */
export function extractSessionYearDigits(academicYear?: string): string {
  if (!academicYear) return "26";
  const clean = academicYear.trim();
  const match = clean.match(/^(\d{4})/);
  if (match) {
    return match[1].slice(-2);
  }
  const digits = clean.replace(/\D/g, '');
  if (digits.length >= 2) {
    return digits.slice(0, 2);
  }
  return "26";
}

/**
 * Find specialty metadata from name or id
 */
export function findSpecialtyMeta(specialtyNameOrId?: string): SpecialtyMatriculeDef {
  if (!specialtyNameOrId) {
    return SPECIALTY_MATRICULE_REGISTRY[20]; // Default to Génie Logiciel
  }

  const s = specialtyNameOrId.toLowerCase().trim();

  const found = SPECIALTY_MATRICULE_REGISTRY.find(item => 
    item.id === s || 
    item.name.toLowerCase() === s ||
    item.name.toLowerCase().includes(s) ||
    s.includes(item.id) ||
    (item.code && s === item.code.toLowerCase())
  );

  if (found) return found;

  // Keyword fallbacks
  if (s.includes('logiciel') || s.includes('dev') || s.includes('program') || s.includes('web') || s.includes('software')) {
    return SPECIALTY_MATRICULE_REGISTRY[20]; // GL
  }
  if (s.includes('réseau') || s.includes('telecom') || s.includes('télécom')) {
    return SPECIALTY_MATRICULE_REGISTRY[21]; // RT
  }
  if (s.includes('cyber') || s.includes('securit') || s.includes('sécurité')) {
    return SPECIALTY_MATRICULE_REGISTRY[22]; // CS
  }
  if (s.includes('data') || s.includes('intelligence') || s.includes(' ia ') || s.startsWith('ia')) {
    return SPECIALTY_MATRICULE_REGISTRY[23]; // IA
  }
  if (s.includes('compta') || s.includes('finance')) {
    return SPECIALTY_MATRICULE_REGISTRY[28]; // CG
  }
  if (s.includes('douane') || s.includes('transit')) {
    return SPECIALTY_MATRICULE_REGISTRY[30]; // DT
  }
  if (s.includes('tuyaut') || s.includes('pipe')) {
    return SPECIALTY_MATRICULE_REGISTRY[0]; // TUY
  }
  if (s.includes('soud') || s.includes('métal')) {
    return SPECIALTY_MATRICULE_REGISTRY[7]; // MST
  }
  if (s.includes('solair') || s.includes('photovolt')) {
    return SPECIALTY_MATRICULE_REGISTRY[15]; // MSS
  }
  if (s.includes('froid') || s.includes('clim')) {
    return SPECIALTY_MATRICULE_REGISTRY[17]; // FCL
  }
  if (s.includes('élec') || s.includes('elec')) {
    return SPECIALTY_MATRICULE_REGISTRY[16]; // ELT
  }

  return SPECIALTY_MATRICULE_REGISTRY[20]; // Fallback to GL
}

export interface GenerateMatriculeOptions {
  studentName: string;
  specialty: string;
  academicYear?: string;
  orderNumber: number; // 1-based alphabetical rank (1 -> "001", 2 -> "002")
  instituteAcronym?: string; // Default: "ITMC"
  useSpecialtyIndexPrefix?: boolean; // Default: true (e.g. 1itmc26gl001 or 21itmc26gl001)
  casing?: 'lower' | 'upper'; // Default: 'upper' (or 'lower')
}

/**
 * Generate official Cameroonian Vocational Training Matricule
 * Structure: [NUM_FILIERE][INSTITUT][ANNEE][CODE_SPEC][ORDRE_ALPHABETIQUE]
 * Example: 21ITMC26GL001 or 1itmc26gl001
 */
export function generateOfficialMatricule(options: GenerateMatriculeOptions): string {
  const {
    specialty,
    academicYear = "2026-2027",
    orderNumber,
    instituteAcronym = "ITMC",
    casing = "upper"
  } = options;

  const specMeta = findSpecialtyMeta(specialty);
  const sessionYear = extractSessionYearDigits(academicYear);
  const orderPad = Math.max(1, orderNumber).toString().padStart(3, '0');
  
  // Format: [Index][Acronym][Year][Code][Order]
  // e.g. 21ITMC26GL001 or 1itmc26gl001
  const rawMatricule = `${specMeta.index}${instituteAcronym}${sessionYear}${specMeta.code}${orderPad}`;

  return casing === 'lower' ? rawMatricule.toLowerCase() : rawMatricule.toUpperCase();
}

/**
 * Parse and decompose a matricule to display its official institutional breakdown
 */
export function decomposeMatricule(matricule: string) {
  if (!matricule) return null;
  const clean = matricule.trim();

  // Regex pattern matching: ^(\d{1,2})([A-Za-z]+)(\d{2})([A-Za-z]+)(\d{3})$
  const match = clean.match(/^(\d{1,2})([A-Za-z]+)(\d{2})([A-Za-z]+)(\d{3})$/);
  if (match) {
    const [, specialtyIndex, institute, year, specialtyCode, order] = match;
    const specMeta = SPECIALTY_MATRICULE_REGISTRY.find(s => 
      s.index === parseInt(specialtyIndex, 10) || 
      s.code.toLowerCase() === specialtyCode.toLowerCase()
    );

    return {
      isValidFormat: true,
      specialtyIndex: parseInt(specialtyIndex, 10),
      instituteAcronym: institute.toUpperCase(),
      sessionYear: `20${year}-20${parseInt(year, 10) + 1}`,
      sessionYearDigits: year,
      specialtyCode: specialtyCode.toUpperCase(),
      specialtyName: specMeta ? specMeta.name : `Filière #${specialtyIndex}`,
      alphabeticalRank: parseInt(order, 10),
      orderPad: order,
      fullMatricule: clean
    };
  }

  return {
    isValidFormat: false,
    fullMatricule: clean
  };
}

/**
 * Sort a list of students in official French alphabetical order by name
 * (handling French accents, lowercase/uppercase properly)
 */
export function sortStudentsAlphabetically<T extends { name?: string }>(students: T[]): T[] {
  return [...students].sort((a, b) => {
    const nameA = (a.name || '').trim();
    const nameB = (b.name || '').trim();
    return nameA.localeCompare(nameB, 'fr', { sensitivity: 'base' });
  });
}
