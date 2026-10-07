const fs = require('fs');

let content = fs.readFileSync('src/pages/teacher/Compositions.tsx', 'utf8');

// Import useOutletContext if it's missing
if (!content.includes('useOutletContext')) {
  content = content.replace("import { useAcademicYear }", "import { useOutletContext } from 'react-router-dom';\nimport { useAcademicYear }");
}

// Extract teacher from context
content = content.replace(
  "export default function TeacherCompositions() {\n  const { selectedYear }",
  "export default function TeacherCompositions() {\n  const { teacher } = useOutletContext<{ teacher: any }>();\n  const { selectedYear }"
);

fs.writeFileSync('src/pages/teacher/Compositions.tsx', content);
console.log('Compositions fixed');
