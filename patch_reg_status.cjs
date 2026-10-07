const fs = require('fs');

let content = fs.readFileSync('src/pages/dashboard/Registrations.tsx', 'utf8');

// We need to actually provision a student if the status becomes "Validé" and they are assigned to a specialty.
// But the student is likely added manually via Students page, or we could auto-create it.
// The user request: "SUR  LINTERFASE  ADMIN LOSQUE UN ELEVE  EST INSCRIP  ON  DEFINIER SA  PECIALITER  INSI   TOUR  SERA ORGANISER"
// We added the specialty drop down on the Students add page.
// The registrations flow is basically approving.
// Let's modify handleStatusChange to also POST to /api/students if validé

const imports = "import { toast } from 'sonner';";
if(!content.includes("import { toast }")) {
   content = content.replace("import { cn } from \"@/lib/utils\";", "import { cn } from \"@/lib/utils\";\nimport { toast } from \"sonner\";");
}

let handleStatusChangeBlock = `
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const regToUpdate = registrations.find(r => r.id === id);
      const response = await fetch(\`/api/registrations/\${id}\`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        setRegistrations(prev => prev.map(reg => 
          reg.id === id ? { ...reg, status: newStatus } : reg
        ));
        if (selectedReg?.id === id) {
          setSelectedReg({ ...selectedReg, status: newStatus });
        }
        
        if (newStatus === 'Validé' && regToUpdate) {
           // Auto create student
           await fetch('/api/students', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
               name: \`\${regToUpdate.firstName} \${regToUpdate.lastName}\`,
               email: regToUpdate.email,
               promo: 'G1',
               status: 'Inscrit',
               phone: regToUpdate.phone || '',
               specialty: regToUpdate.specialty || ''
             })
           });
           toast.success("Étudiant inscrit et affecté à la spécialité !");
        }
      }
    } catch (error) {
      console.error("Error updating status", error);
    }
  };
`;

content = content.replace(
  /const handleStatusChange = async \([\s\S]*?console\.error\("Error updating status", error\);\n    \}\n  \};/m,
  handleStatusChangeBlock
);

fs.writeFileSync('src/pages/dashboard/Registrations.tsx', content);
console.log('Reg updated');
