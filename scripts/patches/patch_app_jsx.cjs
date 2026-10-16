const fs = require('fs');
let content = fs.readFileSync('resources/js/app.jsx', 'utf8');

if (content.includes('eager: true')) {
    // We need to use resolvePageComponent from laravel-vite-plugin
    content = content.replace("import { createInertiaApp } from '@inertiajs/react';", "import { createInertiaApp } from '@inertiajs/react';\nimport { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';");
    
    const resolveRegex = /resolve: \(name\) => {[\s\S]*?return page\.default \|\| page;\n    },/m;
    
    content = content.replace(resolveRegex, "resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),");
    
    fs.writeFileSync('resources/js/app.jsx', content, 'utf8');
}
