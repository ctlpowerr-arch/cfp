const fs = require('fs');

let content = fs.readFileSync('src/pages/dashboard/Students.tsx', 'utf8');

// Import specialties
content = content.replace(
  "import { cn } from \"@/lib/utils\";",
  "import { cn } from \"@/lib/utils\";\nimport { defaultSpecialties } from '@/data/specialtiesData';"
);

// Update formData initialization
content = content.replace(
  "status: 'Inscrit',\n    phone: ''\n  });",
  "status: 'Inscrit',\n    phone: '',\n    specialty: ''\n  });"
);

// Update setFormData after add
content = content.replace(
  "setFormData({ name: '', email: '', promo: 'G1', status: 'Inscrit', phone: '' });",
  "setFormData({ name: '', email: '', promo: 'G1', status: 'Inscrit', phone: '', specialty: '' });"
);

// Update handleOpenEdit
content = content.replace(
  "phone: student.phone || ''\n    });",
  "phone: student.phone || '',\n      specialty: student.specialty || ''\n    });"
);

// Add Specialty column to the table
content = content.replace(
  "<TableHead>Email</TableHead>\n                  <TableHead>Téléphone</TableHead>",
  "<TableHead>Email</TableHead>\n                  <TableHead>Spécialité</TableHead>\n                  <TableHead>Téléphone</TableHead>"
);

content = content.replace(
  "<TableCell className=\"text-slate-500\">{student.email}</TableCell>\n                  <TableCell>",
  "<TableCell className=\"text-slate-500\">{student.email}</TableCell>\n                  <TableCell className=\"font-medium text-slate-700\">{student.specialty || 'Non définie'}</TableCell>\n                  <TableCell>"
);

// Add specialty to the add form
const specialtySelect = `
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Spécialité</Label>
                <Select 
                  value={formData.specialty} 
                  onValueChange={v => setFormData({...formData, specialty: v})}
                >
                  <SelectTrigger className="rounded-2xl h-12 border-slate-100">
                    <SelectValue placeholder="Sélectionner une spécialité" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl max-h-[300px]">
                    {defaultSpecialties.map(sp => (
                      <SelectItem key={sp.id} value={sp.name}>{sp.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
`;

content = content.replace(
  '<div className="grid grid-cols-2 gap-4">',
  specialtySelect + '\n              <div className="grid grid-cols-2 gap-4">'
);

fs.writeFileSync('src/pages/dashboard/Students.tsx', content);
console.log('Students.tsx updated');
