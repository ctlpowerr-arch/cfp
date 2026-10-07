const fs = require('fs');

let content = fs.readFileSync('src/pages/teacher/Compositions.tsx', 'utf8');

// Include specialty in payload
content = content.replace(
  "date: newDate,\n        grades: selectedGrades\n      };",
  "date: newDate,\n        grades: selectedGrades,\n        specialty: teacher.specialty || ''\n      };"
);

fs.writeFileSync('src/pages/teacher/Compositions.tsx', content);
console.log('Compositions logic patched');
