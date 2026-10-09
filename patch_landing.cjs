const fs = require('fs');
let content = fs.readFileSync('resources/js/Pages/Landing/Index.jsx', 'utf8');

// We can add animate-fade-in-up to hero elements and feature cards.
if (!content.includes('animate-fade-in-up')) {
    // Add to hero section main div
    content = content.replace(/className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center lg:pt-32"/, 'className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center lg:pt-32 animate-fade-in-up will-change-transform"');
    
    // Add to features grid
    content = content.replace(/className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"/, 'className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in-up will-change-transform" style={{animationDelay: "0.2s", animationFillMode: "both"}}');
    
    fs.writeFileSync('resources/js/Pages/Landing/Index.jsx', content, 'utf8');
}
