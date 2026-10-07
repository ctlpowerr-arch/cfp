const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "const { name, title, description, lessonsCount, lessons, startDate } = req.body;",
  "const { name, title, description, lessonsCount, lessons, startDate, specialty } = req.body;"
);

code = code.replace(
  "completed: 0,\n        academicYear: ay\n      };",
  "completed: 0,\n        academicYear: ay,\n        specialty: specialty || ''\n      };"
);

fs.writeFileSync('server.ts', code);
console.log('server.ts updated');
