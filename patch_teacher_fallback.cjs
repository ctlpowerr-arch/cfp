const fs = require('fs');

let layout = fs.readFileSync('src/layouts/TeacherLayout.tsx', 'utf8');

layout = layout.replace(
  'id: "TCH-001",\n          name: "Dr. Jean-Paul Kamga",\n          email: "demo@itmc-it.cm",\n          function: "Chef de Département",\n          department: "Informatique",',
  'id: "TCH-001",\n          name: "Dr. Jean-Paul Kamga",\n          email: "demo@itmc-it.cm",\n          function: "Chef de Département",\n          department: "Informatique",\n          specialty: "Développeur logiciel",'
);

fs.writeFileSync('src/layouts/TeacherLayout.tsx', layout);
console.log('TeacherLayout patched');
