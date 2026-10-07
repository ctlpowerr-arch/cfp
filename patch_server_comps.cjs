const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// The specialty is required for composing if teacher is composing
code = code.replace(
  "const { title, type, promo, department, level, subject, teacherName, coefficient, maxScore, date } = req.body;",
  "const { title, type, promo, department, level, subject, teacherName, coefficient, maxScore, date, specialty } = req.body;"
);

// Target students based on promo AND specialty if it's passed
code = code.replace(
  "const targetStudents = promo && promo !== 'Toutes'\n          ? studData.filter((s: any) => s.promo === promo)\n          : studData;",
  "let targetStudents = promo && promo !== 'Toutes' ? studData.filter((s: any) => s.promo === promo) : studData;\n        if (specialty) targetStudents = targetStudents.filter((s: any) => s.specialty === specialty);"
);

fs.writeFileSync('server.ts', code);
console.log('server.ts updated for comps');
