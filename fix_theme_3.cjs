const fs = require('fs');

let content = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

// Fix text colors in other parts of the dashboard to remove dark mode and use neutral/green colors
content = content.replace(/dark:bg-white\/5/g, '');
content = content.replace(/dark:border-white\/5/g, '');
content = content.replace(/bg-slate-50\b/g, 'bg-white');
content = content.replace(/bg-slate-50\/50/g, 'bg-[#EDF2F7]');
content = content.replace(/border-slate-100/g, 'border-[#E2E8F0]');
content = content.replace(/text-slate-900/g, 'text-[#1A202C]');
content = content.replace(/text-slate-500/g, 'text-[#718096]');
content = content.replace(/text-slate-400/g, 'text-[#A0AEC0]');

// Revenue dynamics box
content = content.replace(/bg-[#0F172A] p-8 rounded-\[3rem\] text-white/g, 'bg-[#1B4332] p-8 rounded-[3rem] text-white');
content = content.replace(/bg-[#0F172A]\/95/g, 'bg-[#1A202C]/95');

fs.writeFileSync('src/pages/AdminDashboard.tsx', content);
