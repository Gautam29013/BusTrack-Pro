const fs = require('fs');
const path = require('path');

const replacements = {
  "'#0a0f1e'": "'var(--bg-primary)'",
  '"#0a0f1e"': '"var(--bg-primary)"',
  "'#0d1424'": "'var(--bg-secondary)'",
  '"#0d1424"': '"var(--bg-secondary)"',
  "'#f1f5f9'": "'var(--text-primary)'",
  '"#f1f5f9"': '"var(--text-primary)"',
  "'#94a3b8'": "'var(--text-secondary)'",
  '"#94a3b8"': '"var(--text-secondary)"',
  "'#475569'": "'var(--text-muted)'",
  '"#475569"': '"var(--text-muted)"',
  "'rgba(255,255,255,0.07)'": "'var(--border)'",
  "'rgba(255,255,255,0.1)'": "'var(--border-bright)'",
  "'rgba(13,20,36,0.95)'": "'var(--bg-glass)'",
  "'rgba(13,20,36,0.9)'": "'var(--bg-glass)'",
  "'rgba(13, 20, 36, 0.95)'": "'var(--bg-glass)'",
  "'#10b981'": "'var(--accent-emerald)'",
  "'#f43f5e'": "'var(--accent-rose)'",
  "'#3b82f6'": "'var(--accent-blue)'",
};

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.js') || file.endsWith('.jsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./frontend/app');
let modifiedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  
  for (const [oldVal, newVal] of Object.entries(replacements)) {
    newContent = newContent.split(oldVal).join(newVal);
  }
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    modifiedCount++;
    console.log('Updated', file);
  }
});
console.log('Total files updated:', modifiedCount);
