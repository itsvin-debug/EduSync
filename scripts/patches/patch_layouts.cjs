const fs = require('fs');
['AdminLayout.jsx', 'StudentLayout.jsx', 'TeacherLayout.jsx'].forEach(file => {
    let content = fs.readFileSync(`resources/js/Layouts/${file}`, 'utf8');
    
    // add key={usePage().url.split('?')[0]} to the main content wrapper
    // Find the `<main` or a wrapper around `{children}`
    // Since I don't know the exact DOM, I'll wrap {children} with a div
    
    if (!content.includes('animate-fade-in-up')) {
        content = content.replace('{children}', `<div key={usePage().url.split('?')[0]} className="animate-fade-in-up will-change-transform">{children}</div>`);
        fs.writeFileSync(`resources/js/Layouts/${file}`, content, 'utf8');
    }
});
