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
    
    // Replace transition-colors with transition-colors duration-300 ease-out
    content = content.replace(/\btransition-colors\b(?! duration-)/g, 'transition-colors duration-300 ease-out');
    
    // Replace transition-all with transition-all duration-300 ease-out
    content = content.replace(/\btransition-all\b(?! duration-)/g, 'transition-all duration-300 ease-out');
    
    // Replace transition-transform with transition-transform duration-300 ease-out
    content = content.replace(/\btransition-transform\b(?! duration-)/g, 'transition-transform duration-300 ease-out');

    // Make hover shadow smoother
    content = content.replace(/hover:shadow-(sm|md|lg)/g, 'hover:shadow-md hover:shadow-indigo-500/10');

    // Enhance hover translations on cards if they have hover:border... transition-all but no hover:-translate-y-1
    // Actually, just looking for cards to add scale or translateY.
    // We can do something simpler:
    content = content.replace(/hover:border-slate-300/g, 'hover:border-indigo-300 hover:-translate-y-1');

    // Remove duplicates if any
    content = content.replace(/duration-300 duration-300/g, 'duration-300');
    content = content.replace(/ease-out ease-out/g, 'ease-out');

    fs.writeFileSync(file, content, 'utf8');
});
console.log('Hovers updated for modern, smooth transitions.');
