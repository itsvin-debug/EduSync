const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if(file.endsWith('.jsx')) results.push(file);
        }
    });
    return results;
}

const files = walk('./resources/js');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Add smooth transitions if they don't have it
    content = content.replace(/\btransition-colors\b(?! duration-)/g, 'transition-colors duration-300 ease-out');
    content = content.replace(/\btransition-all\b(?! duration-)/g, 'transition-all duration-300 ease-out');
    content = content.replace(/\btransition-transform\b(?! duration-)/g, 'transition-transform duration-300 ease-out');

    // Upgrade border hover to be more modern and pop up slightly
    content = content.replace(/hover:border-slate-300/g, 'hover:border-indigo-300 hover:-translate-y-1 hover:shadow-lg');
    content = content.replace(/hover:shadow-sm/g, 'hover:shadow-md');

    // Optimize list item hovers (e.g. bg-slate-50 hover:bg-slate-100)
    content = content.replace(/hover:bg-slate-100(?! hover:scale)/g, 'hover:bg-slate-100 hover:scale-[1.01] will-change-transform');

    fs.writeFileSync(file, content, 'utf8');
});
console.log('Hovers updated for modern, smooth transitions.');
