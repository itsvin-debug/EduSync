const fs = require('fs');
let css = fs.readFileSync('resources/css/app.css', 'utf8');

// replace existing animations with faster bouncy ones
css = css.replace(/--animate-fade-in:.*/g, '--animate-fade-in: fade-in 0.2s ease-out;');
css = css.replace(/--animate-fade-in-up:.*/g, '--animate-fade-in-up: fade-in-up 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);');
css = css.replace(/--animate-slide-in:.*/g, '--animate-slide-in: slide-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);');

if (!css.includes('--ease-bouncy')) {
    css = css.replace('@theme {', `@theme {\n    --ease-bouncy: cubic-bezier(0.34, 1.56, 0.64, 1);`);
}

fs.writeFileSync('resources/css/app.css', css, 'utf8');
