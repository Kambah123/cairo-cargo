const fs = require('fs');

let content = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf8');

// 1. Min-h-screen bg
content = content.replace(/className="min-h-screen bg-slate-50 dark:bg-\[#0B0F19\]"/g, 'className="min-h-screen bg-[#F8F9FA]"');

// 2. Sidebar bg
content = content.replace(/className="hidden md:flex w-\[280px\] flex-col bg-\[#0F172A\] border-r border-white\/5 h-\[calc\(100vh-64px\)\] sticky top-16"/g, 'className="hidden md:flex w-[280px] flex-col bg-white border-r border-[#E2E8F0] h-[calc(100vh-64px)] sticky top-16"');

// 3. Sidebar items
content = content.replace(/className={`w-full flex justify-between items-center px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 \${[\s\S]*?}`}/g,
`className={\`w-full flex justify-between items-center px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 \${
              location.pathname === item.path
                ? 'bg-[#EDF2F7] text-[#1B4332]'
                : 'text-[#4A5568] hover:bg-[#EDF2F7]/50 hover:text-[#1B4332]'
            }\`}`);

// 4. Buttons in Hero
content = content.replace(/bg-blue-600/g, 'bg-[#1B4332]');
content = content.replace(/bg-slate-900 dark:bg-white dark:text-slate-900 text-white/g, 'bg-white text-[#1B4332] border border-[#1B4332]');
content = content.replace(/border border-slate-200 dark:border-white\/10 text-slate-700 dark:text-white bg-white dark:bg-slate-800/g, 'border border-[#E2E8F0] text-[#4A5568] bg-white');
content = content.replace(/bg-white dark:bg-slate-800 border border-slate-200 dark:border-white\/10 text-slate-700 dark:text-white/g, 'border border-[#E2E8F0] text-[#4A5568] bg-white');

// 5. StatCards remove dark classes
content = content.replace(/dark:bg-slate-900/g, '');
content = content.replace(/dark:border-white\/5/g, '');
content = content.replace(/dark:text-white/g, '');

// 6. Fix text colors in Hero
content = content.replace(/text-slate-900 dark:text-white/g, 'text-[#1A202C]');
content = content.replace(/text-slate-400 font-medium/g, 'text-[#718096] font-medium');

// 7. StatCard definition
content = content.replace(/text-slate-900 dark:text-white/g, 'text-[#1A202C]');

fs.writeFileSync('src/pages/AdminDashboard.tsx', content);
