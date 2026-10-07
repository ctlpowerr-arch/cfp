const fs = require('fs');

let content = fs.readFileSync('src/pages/teacher/Modules.tsx', 'utf8');

content = content.replace(
  "const relMods = await modRes.json();\n        setModules(relMods);",
  "const relMods = await modRes.json();\n        const myMods = teacher.specialty ? relMods.filter((m: any) => m.specialty === teacher.specialty) : relMods;\n        setModules(myMods);"
);

// When creating a new module, assign the teacher's specialty
content = content.replace(
  "const newMod = { name: newModuleData.name, description: newModuleData.description };",
  "const newMod = { name: newModuleData.name, description: newModuleData.description, specialty: teacher.specialty || '' };"
);

fs.writeFileSync('src/pages/teacher/Modules.tsx', content);
console.log('Teacher Modules patched');
