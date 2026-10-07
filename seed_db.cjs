const fs = require('fs');

// Read specialties
const fileContent = fs.readFileSync('src/data/specialtiesData.ts', 'utf8');

const regex = /name: "([^"]+)",/g;
let match;
let specialtyNames = [];
let count = 0;
while ((match = regex.exec(fileContent)) !== null) {
  const name = match[1];
  // Skip the filiere names that appear at the top. There are 5 of them: "Automobile", "Énergie", "Technologies de l'information et du numérique", "Génie civil, BTP et construction", "Gestion, administration et commerce"
  if (count >= 5) {
      specialtyNames.push(name);
  }
  count++;
}

// Generate 3 students and 2 teachers per specialty
let students = [];
let teachers = [];

let sid = 1000;
let tid = 2000;

for (const sp of specialtyNames) {
  // Add 3 students
  for (let i = 1; i <= 3; i++) {
    students.push({
      id: String(sid++),
      name: `Student ${i} - ${sp}`,
      promo: "G1",
      email: `student${sid}@test.com`,
      prog: Math.floor(Math.random() * 50) + 40,
      attendance: Math.floor(Math.random() * 20) + 80,
      lastGrade: "14/20",
      status: "Inscrit",
      specialty: sp,
      bio: "Generated for testing",
      phone: "+237 600000000",
      academicYear: "2025-2026"
    });
  }

  // Add 2 teachers
  for (let i = 1; i <= 2; i++) {
    teachers.push({
      id: String(tid++),
      name: `Prof. ${i} - ${sp}`,
      email: `prof${tid}@test.com`,
      password: "password123", // Basic password for testing
      specialty: sp,
      status: "Actif",
      academicYear: "2025-2026"
    });
  }
}

fs.writeFileSync('students.json', JSON.stringify(students, null, 2));
fs.writeFileSync('teachers.json', JSON.stringify(teachers, null, 2));

console.log(`Generated ${students.length} students and ${teachers.length} teachers.`);
