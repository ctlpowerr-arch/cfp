const fs = require('fs');

let content = fs.readFileSync('src/pages/teacher/Compositions.tsx', 'utf8');

content = content.replace(
  "setStudents(Array.isArray(studRes) ? studRes : []);",
  "setStudents(Array.isArray(studRes) ? (teacher.specialty ? studRes.filter(s => s.specialty === teacher.specialty) : studRes) : []);"
);

fs.writeFileSync('src/pages/teacher/Compositions.tsx', content);
console.log('Compositions patched');
