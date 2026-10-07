const fs = require('fs');

const firstNames = [
  "Alexandre", "Brenda", "Cédric", "Diane", "Emmanuel", "Fabiola", "Gilles", "Hélène",
  "Igor", "Jacqueline", "Kévin", "Laetitia", "Marc", "Nina", "Olivier", "Patricia",
  "Quentin", "Rachel", "Serge", "Tatiana", "Ulrich", "Vanessa", "Wilfried", "Yolande",
  "Zacharie", "Alain", "Brigitte", "Christian", "Dorothée", "Eric", "Francine", "Guy",
  "Henriette", "Ismaël", "Josiane", "Karl", "Linda", "Martial", "Nadine", "Patrick",
  "Rose", "Thierry", "Valérie", "Yves", "Astrid", "Bertrand", "Chantal", "David",
  "Estelle", "Franck", "Gisèle", "Hervé", "Inès", "Joseph", "Karen", "Laurent",
  "Muriel", "Norbert", "Olga", "Paul", "Rita", "Stéphane", "Thérèse", "Victor",
  "Wanda", "Xavier", "Yvette", "Jules", "Carine", "Brice", "Sandrine", "Donald",
  "Nadine", "Rodrigue", "Clarisse", "Landry", "Solange", "Florent", "Priscille", "Arnaud"
];

const lastNames = [
  "Fotso", "Kamdem", "Ngassa", "Tientcheu", "Mbida", "Ebongue", "Diallo", "Nsangou",
  "Abena", "Talla", "Etoa", "Atangana", "Nana", "Nkoumou", "Kengne", "Mbassi",
  "Mbang", "Njo-Leya", "Moukoko", "Bikélé", "Fonkou", "Tchinda", "Kenfack", "Djoumessi",
  "Youmbi", "Nya", "Kouam", "Nganjou", "Wambo", "Tagne", "Siewe", "Happi",
  "Foko", "Nguetsop", "Dongmo", "Metsena", "Ondoa", "Owona", "Manga", "Mbarga",
  "Essomba", "Mvondo", "Nnomo", "Zambo", "Balla", "Abanda", "Awono", "Kougang"
];

// 10 Distinct Structured Classes with Rooms
const CLASSES = [
  { code: "G1-GL", promo: "G1", specialty: "Génie Logiciel", department: "Informatique & Numérique", room: "Labo Info 1", studentCount: 8 },
  { code: "G2-GL", promo: "G2", specialty: "Génie Logiciel", department: "Informatique & Numérique", room: "Labo Info 2", studentCount: 8 },
  { code: "L3-GL", promo: "L3", specialty: "Génie Logiciel", department: "Informatique & Numérique", room: "Amphi Turing", studentCount: 8 },
  { code: "R1-RCS", promo: "R1", specialty: "Cyber-sécurité & Réseaux", department: "Réseaux, Telecoms & Sécurité", room: "Labo Réseaux A", studentCount: 8 },
  { code: "R2-RCS", promo: "R2", specialty: "Cyber-sécurité & Réseaux", department: "Réseaux, Telecoms & Sécurité", room: "Labo Réseaux B", studentCount: 8 },
  { code: "L3-RCS", promo: "L3", specialty: "Cyber-sécurité & Réseaux", department: "Réseaux, Telecoms & Sécurité", room: "Amphi Cisco", studentCount: 8 },
  { code: "D1-DES", promo: "D1", specialty: "Infographie & UI/UX Design", department: "Arts Graphiques & Audiovisuel", room: "Atelier Graphique 1", studentCount: 8 },
  { code: "D2-DES", promo: "D2", specialty: "Infographie & UI/UX Design", department: "Arts Graphiques & Audiovisuel", room: "Atelier Graphique 2", studentCount: 8 },
  { code: "C1-CMD", promo: "C1", specialty: "Comptabilité & Marketing Digital", department: "Gestion, Commerce & Administration", room: "Salle 201", studentCount: 8 },
  { code: "C2-CMD", promo: "C2", specialty: "Comptabilité & Marketing Digital", department: "Gestion, Commerce & Administration", room: "Salle 202", studentCount: 8 },
];

const SUBJECTS_BY_SPECIALTY = {
  "Génie Logiciel": [
    "Algorithmique & Structures de Données",
    "Développement Web React & Node.js",
    "Architecture Cloud & DevOps",
    "Bases de Données Relationnelles SQL",
    "Génie Logiciel & UML"
  ],
  "Cyber-sécurité & Réseaux": [
    "Sécurité des Réseaux & Firewalls",
    "Administration Systèmes Linux",
    "Cryptographie & Cybersécurité",
    "Télécoms & Routing IP",
    "Audits de Sécurité Informatique"
  ],
  "Infographie & UI/UX Design": [
    "Design UI/UX & Figma",
    "Infographie 2D/3D & Suite Adobe",
    "Montage Vidéo & Motion Design",
    "Ergonomie & Maquettage Web"
  ],
  "Comptabilité & Marketing Digital": [
    "Comptabilité Informatisée Sage",
    "Marketing Digital & Social Media",
    "E-Commerce & Stratégie Web",
    "Gestion de Projets & CRM"
  ]
};

// Generate 80 Students distributed across the 10 classes (8 per class)
const students = [];
let studentIdCounter = 101;

CLASSES.forEach((cls) => {
  for (let i = 0; i < cls.studentCount; i++) {
    const fn = firstNames[(studentIdCounter * 3 + i) % firstNames.length];
    const ln = lastNames[(studentIdCounter * 5 + i) % lastNames.length];
    const name = `${fn} ${ln}`;
    const email = `${fn.toLowerCase()}.${ln.toLowerCase().replace(/[^a-z]/g, '')}${studentIdCounter}@itmc-it.cm`;
    const statuses = ["Excellent", "Actif", "En progrès", "À risque"];
    const status = statuses[(studentIdCounter + i) % statuses.length];
    const prog = Math.floor(Math.random() * 45) + 50;
    const attendance = Math.floor(Math.random() * 15) + 85;
    const gradeVal = (Math.random() * 6 + 13.5).toFixed(1);

    students.push({
      id: `std_${studentIdCounter}`,
      name,
      promo: cls.promo,
      classCode: cls.code,
      className: `${cls.promo} ${cls.specialty}`,
      specialty: cls.specialty,
      department: cls.department,
      room: cls.room,
      email,
      prog,
      attendance,
      lastGrade: `${gradeVal}/20`,
      status,
      bio: `Étudiant(e) en ${cls.specialty} (${cls.promo}) - CFP-ITMC Douala. Salle: ${cls.room}.`,
      phone: `+237 6${Math.floor(Math.random() * 89999999 + 10000000)}`,
      academicYear: "2026-2027"
    });
    studentIdCounter++;
  }
});

// Generate 40 Professors with specific assigned classes and subjects
const teacherFunctions = [
  "Chef de Département",
  "Professeur Titulaire",
  "Enseignant Senior",
  "Maître de Conférences",
  "Expert Formateur",
  "Responsable Pédagogique"
];
const teacherTitles = ["Dr.", "Prof.", "Ing.", "Mme", "M."];

const teachers = [];

// Teacher 1: Demo Teacher (Professeur Démo)
const demoClasses = [
  { classCode: "G1-GL", className: "G1 - Génie Logiciel", room: "Labo Info 1", subject: "Algorithmique & Structures de Données", studentCount: 8, schedule: "Lundi 08h-11h" },
  { classCode: "R2-RCS", className: "R2 - Cyber-sécurité", room: "Labo Réseaux B", subject: "Sécurité des Réseaux & Firewalls", studentCount: 8, schedule: "Mardi 13h-16h" },
  { classCode: "L3-GL", className: "L3 - Génie Logiciel", room: "Amphi Turing", subject: "Architecture Cloud & DevOps", studentCount: 8, schedule: "Jeudi 09h-12h" }
];

teachers.push({
  id: "demo_teacher",
  name: "Professeur Démo",
  email: "demo@itmc-it.cm",
  password: "demo123",
  function: "Chef de Département",
  department: "Informatique & Numérique",
  mainSpecialty: "Génie Logiciel",
  specialties: ["Génie Logiciel", "Cyber-sécurité & Réseaux", "Cloud & DevOps"],
  promotions: ["G1", "R2", "L3"],
  assignedClasses: demoClasses,
  studentsCount: 24, // 8 + 8 + 8
  activeStudents: 22,
  atRiskStudents: 1,
  progress: 88,
  successRate: 95,
  presenceRate: 96,
  lastSeen: "En ligne",
  status: "Actif",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=DemoTeacher",
  performanceScore: 96,
  recruitmentDate: "2022-09-01",
  degree: "Doctorat en Génie Logiciel",
  modules: [
    {
      id: "MOD-DEMO-1",
      name: "Algorithmique & Structures de Données",
      classCode: "G1-GL",
      room: "Labo Info 1",
      subject: "Génie Logiciel",
      progress: 90,
      lessons: 14,
      completed: 12,
      status: "In Progress",
      startDate: "2026-09-15",
      endDate: "2027-01-20"
    },
    {
      id: "MOD-DEMO-2",
      name: "Sécurité des Réseaux & Firewalls",
      classCode: "R2-RCS",
      room: "Labo Réseaux B",
      subject: "Cyber-sécurité & Réseaux",
      progress: 75,
      lessons: 10,
      completed: 7,
      status: "In Progress",
      startDate: "2026-10-01",
      endDate: "2027-02-15"
    },
    {
      id: "MOD-DEMO-3",
      name: "Architecture Cloud & DevOps",
      classCode: "L3-GL",
      room: "Amphi Turing",
      subject: "Cloud & DevOps",
      progress: 80,
      lessons: 12,
      completed: 9,
      status: "In Progress",
      startDate: "2026-09-20",
      endDate: "2027-01-30"
    }
  ],
  metrics: { videos: 28, pdfs: 35, quizzes: 12, tds: 15, tps: 10, docs: 22 },
  performanceHistory: [
    { name: 'S1', value: 65 }, { name: 'S2', value: 72 }, { name: 'S3', value: 84 },
    { name: 'S4', value: 89 }, { name: 'S5', value: 96 }
  ],
  academicYear: "2026-2027"
});

// Generate remaining 39 Teachers
for (let i = 1; i < 40; i++) {
  const fn = firstNames[(i * 2 + 1) % firstNames.length];
  const ln = lastNames[(i * 3 + 2) % lastNames.length];
  const title = teacherTitles[i % teacherTitles.length];
  const name = `${title} ${fn} ${ln}`;
  const func = teacherFunctions[i % teacherFunctions.length];
  
  // Pick 1 to 3 assigned classes for this teacher
  const classCount = (i % 3) + 1; // 1, 2 or 3 classes
  const assignedClasses = [];
  let totalStudents = 0;
  const teacherSpecialtiesSet = new Set();
  const teacherPromosSet = new Set();

  for (let c = 0; c < classCount; c++) {
    const targetClass = CLASSES[(i + c * 3) % CLASSES.length];
    const availableSubjects = SUBJECTS_BY_SPECIALTY[targetClass.specialty] || ["Informatique Générale"];
    const subject = availableSubjects[(i + c) % availableSubjects.length];

    assignedClasses.push({
      classCode: targetClass.code,
      className: `${targetClass.promo} - ${targetClass.specialty}`,
      room: targetClass.room,
      subject,
      studentCount: targetClass.studentCount,
      schedule: c === 0 ? "Lundi 08h-11h" : c === 1 ? "Mercredi 10h-13h" : "Vendredi 14h-17h"
    });

    totalStudents += targetClass.studentCount;
    teacherSpecialtiesSet.add(targetClass.specialty);
    teacherPromosSet.add(targetClass.promo);
  }

  const dept = CLASSES[(i) % CLASSES.length].department;
  const email = `${fn.toLowerCase().substring(0, 2)}.${ln.toLowerCase().replace(/[^a-z]/g, '')}${i}@itmc-it.cm`;

  teachers.push({
    id: `tch_${i + 200}`,
    name,
    email,
    password: "demo123",
    function: func,
    department: dept,
    mainSpecialty: Array.from(teacherSpecialtiesSet)[0],
    specialties: Array.from(teacherSpecialtiesSet),
    promotions: Array.from(teacherPromosSet),
    assignedClasses,
    studentsCount: totalStudents,
    activeStudents: Math.floor(totalStudents * 0.9),
    atRiskStudents: Math.floor(totalStudents * 0.05),
    progress: Math.floor(Math.random() * 30) + 65,
    successRate: Math.floor(Math.random() * 12) + 85,
    presenceRate: Math.floor(Math.random() * 10) + 88,
    lastSeen: i % 2 === 0 ? "En ligne" : `Il y a ${i % 4 + 1}h`,
    status: "Actif",
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fn}${ln}`,
    performanceScore: Math.floor(Math.random() * 12) + 85,
    recruitmentDate: `202${i % 4 + 1}-09-01`,
    degree: title === "Dr." ? "Doctorat" : title === "Prof." ? "Doctorat d'État" : "Master 2 / Ingénieur",
    modules: assignedClasses.map((ac, mIdx) => ({
      id: `MOD-${i}-${mIdx + 1}`,
      name: ac.subject,
      classCode: ac.classCode,
      room: ac.room,
      subject: ac.subject,
      progress: Math.floor(Math.random() * 40) + 50,
      lessons: 10,
      completed: 6,
      status: "In Progress",
      startDate: "2026-09-15",
      endDate: "2027-01-20"
    })),
    metrics: {
      videos: Math.floor(Math.random() * 15) + 10,
      pdfs: Math.floor(Math.random() * 20) + 15,
      quizzes: Math.floor(Math.random() * 6) + 4,
      tds: Math.floor(Math.random() * 8) + 4,
      tps: Math.floor(Math.random() * 8) + 4,
      docs: Math.floor(Math.random() * 15) + 8
    },
    performanceHistory: [
      { name: 'S1', value: 60 + (i % 15) },
      { name: 'S2', value: 70 + (i % 15) },
      { name: 'S3', value: 80 + (i % 10) },
      { name: 'S4', value: 88 + (i % 8) }
    ],
    academicYear: "2026-2027"
  });
}

// Generate Relational Modules list for students
// Each class will have modules taught by their assigned teachers!
const allModules = [];
let modIdCounter = 1;

teachers.forEach(teacher => {
  teacher.assignedClasses.forEach(ac => {
    allModules.push({
      id: `mod_rel_${modIdCounter++}`,
      name: ac.subject,
      description: `Cours de ${ac.subject} dispensé en ${ac.className} (Salle: ${ac.room}).`,
      teacherId: teacher.id,
      teacherName: teacher.name,
      teacherEmail: teacher.email,
      classCode: ac.classCode,
      className: ac.className,
      room: ac.room,
      specialty: ac.className.split(' - ')[1] || "Informatique",
      progress: Math.floor(Math.random() * 40) + 35,
      startDate: "15 Sept 2026",
      academicYear: "2026-2027",
      lessons: [
        {
          id: `les_rel_${modIdCounter}_1`,
          title: `Introduction à ${ac.subject}`,
          description: `Concepts fondamentaux, objectifs et syllabus.`,
          isSuspended: false,
          resources: [
            { id: `res_${modIdCounter}_1`, title: `Support PDF - Introduction`, type: "pdf", status: "active", date: "15 SEPT 2026" },
            { id: `res_${modIdCounter}_2`, title: `Vidéo de présentation`, type: "video", status: "active", date: "16 SEPT 2026" }
          ],
          quizzes: [
            {
              id: `quiz_${modIdCounter}_1`,
              title: `Quiz de contrôle 1 - ${ac.subject}`,
              timer: 300,
              questions: [
                { id: `q_${modIdCounter}_1`, text: "Quelle est la notion clé abordée dans cette leçon ?", type: "text", maxPoints: 10 }
              ]
            }
          ]
        },
        {
          id: `les_rel_${modIdCounter}_2`,
          title: `Travaux Pratiques - ${ac.subject}`,
          description: `Mise en application guidée en salle ${ac.room}.`,
          isSuspended: false,
          resources: [
            { id: `res_${modIdCounter}_3`, title: `Sujet de TP 1`, type: "pdf", status: "active", date: "22 SEPT 2026" }
          ],
          quizzes: []
        }
      ]
    });
  });
});

// Generate Registrations (80 Real Student Dossiers)
const registrations = students.map((std, idx) => {
  const day = (idx % 28) + 1;
  const dateStr = `${day < 10 ? '0' + day : day}/09/2026`;
  const fn = std.name.split(' ')[0];
  const ln = std.name.split(' ').slice(1).join(' ');

  return {
    id: `REG-${std.id.replace('std_', '').toUpperCase()}`,
    name: std.name,
    firstName: fn,
    lastName: ln,
    email: std.email,
    phone: std.phone,
    specialty: std.specialty,
    classCode: std.classCode,
    registrationDate: dateStr,
    status: idx % 6 === 0 ? "En attente" : "Validé",
    timeSlot: idx % 2 === 0 ? "Cours du Jour (08h00 - 14h00)" : "Cours du Soir (17h00 - 21h00)",
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fn}${ln}`,
    documents: {
      diploma: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      birthCertificate: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      cni: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      medicalCertificate: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    },
    academicYear: "2026-2027"
  };
});

// Generate Schedule (Relational Timetable entries for all teachers & classes)
const schedule = [];
let scheduleIdCounter = 1;
const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const TYPES = ['Cours', 'TD', 'TP', 'Examen'];

// First, make sure Demo Teacher has a comprehensive schedule
teachers.forEach((teacher, tIdx) => {
  teacher.assignedClasses.forEach((ac, cIdx) => {
    // Generate 2 to 3 sessions per assigned class across days
    const day1 = DAYS[(tIdx + cIdx * 2) % DAYS.length];
    const day2 = DAYS[(tIdx + cIdx * 2 + 2) % DAYS.length];

    const hour1 = (8 + (cIdx * 3) % 7) < 10 ? `0${8 + (cIdx * 3) % 7}h` : `${8 + (cIdx * 3) % 7}h`;
    const hour2 = (11 + (cIdx * 2) % 5) < 10 ? `0${11 + (cIdx * 2) % 5}h` : `${11 + (cIdx * 2) % 5}h`;

    schedule.push({
      id: `sch_${scheduleIdCounter++}`,
      teacherId: teacher.id,
      teacherName: teacher.name,
      teacherEmail: teacher.email,
      classCode: ac.classCode,
      className: ac.className,
      specialty: ac.className.split(' - ')[1] || "Informatique",
      subject: ac.subject,
      room: ac.room || `Salle B0${(cIdx % 4) + 1}`,
      day: day1,
      hour: hour1,
      duration: "3h",
      type: TYPES[(tIdx + cIdx) % TYPES.length],
      academicYear: "2026-2027"
    });

    schedule.push({
      id: `sch_${scheduleIdCounter++}`,
      teacherId: teacher.id,
      teacherName: teacher.name,
      teacherEmail: teacher.email,
      classCode: ac.classCode,
      className: ac.className,
      specialty: ac.className.split(' - ')[1] || "Informatique",
      subject: ac.subject,
      room: ac.room || `Labo Info ${(cIdx % 3) + 1}`,
      day: day2,
      hour: hour2,
      duration: "2h",
      type: TYPES[(tIdx + cIdx + 1) % TYPES.length],
      academicYear: "2026-2027"
    });
  });
});

fs.writeFileSync('students.json', JSON.stringify(students, null, 2));
fs.writeFileSync('teachers.json', JSON.stringify(teachers, null, 2));
fs.writeFileSync('modules.json', JSON.stringify(allModules, null, 2));
fs.writeFileSync('registrations.json', JSON.stringify(registrations, null, 2));
fs.writeFileSync('schedule.json', JSON.stringify(schedule, null, 2));

console.log(`Relational Data successfully generated!`);
console.log(`- Students: ${students.length} across 10 classes`);
console.log(`- Teachers: ${teachers.length} (with assigned classes & subjects)`);
console.log(`- Modules: ${allModules.length} relational modules linking teachers to classes`);
console.log(`- Registrations: ${registrations.length} student dossiers`);
console.log(`- Schedule: ${schedule.length} timetable sessions generated`);
