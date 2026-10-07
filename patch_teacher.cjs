const fs = require('fs');

let overview = fs.readFileSync('src/pages/teacher/Overview.tsx', 'utf8');

const importUseEffect = "import React, { useState, useEffect } from 'react';";
overview = overview.replace("import React, { useState } from 'react';", importUseEffect);

const stateAndFetch = `
  const [realStudentsCount, setRealStudentsCount] = useState(0);
  
  useEffect(() => {
    fetch('/api/students')
      .then(res => res.json())
      .then(data => {
        const myStudents = teacher.specialty ? data.filter(s => s.specialty === teacher.specialty) : data;
        setRealStudentsCount(myStudents.length);
      })
      .catch(console.error);
  }, [teacher.specialty]);
`;

overview = overview.replace("const [isCourseActive, setIsCourseActive] = useState(false);", "const [isCourseActive, setIsCourseActive] = useState(false);" + stateAndFetch);
overview = overview.replace("value: teacher.studentsCount", "value: realStudentsCount");

fs.writeFileSync('src/pages/teacher/Overview.tsx', overview);

let students = fs.readFileSync('src/pages/teacher/Students.tsx', 'utf8');

students = students.replace(
  "const data = await res.json();\n        setStudents(data);",
  "const data = await res.json();\n        const myStudents = teacher.specialty ? data.filter((s: any) => s.specialty === teacher.specialty) : data;\n        setStudents(myStudents);"
);

fs.writeFileSync('src/pages/teacher/Students.tsx', students);

console.log('Teacher pages patched');
