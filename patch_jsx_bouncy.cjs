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
    
    // Change duration-300 to duration-200 (faster)
    content = content.replace(/duration-300/g, 'duration-200');
    
    // Change ease-out to ease-bouncy
    content = content.replace(/ease-out/g, 'ease-bouncy');

    // Add click "press" effect (active:scale-95 or active:scale-90)
    // To safe-guard, we only append it to classes that have 'hover:' and don't already have 'active:scale'
    // Let's replace 'hover:-translate-y-1' with 'hover:-translate-y-1 active:scale-[0.98]'
    content = content.replace(/hover:-translate-y-1(?! active:scale)/g, 'hover:-translate-y-1 active:scale-[0.97]');
    
    // For things that scale up on hover, let them scale down on click
    content = content.replace(/hover:scale-\[1.01\](?! active:scale)/g, 'hover:scale-[1.01] active:scale-[0.97]');
    content = content.replace(/hover:scale-105(?! active:scale)/g, 'hover:scale-105 active:scale-95');
    
    // Make standard buttons bouncy on click
    // Search for button classes like hover:bg-slate-100 or hover:bg-slate-800
    // Actually, simply adding active:scale-95 to elements that have transition-colors or transition-all works if they are clickable.
    
    fs.writeFileSync(file, content, 'utf8');
});
console.log('Bouncy effects applied to JSX.');
