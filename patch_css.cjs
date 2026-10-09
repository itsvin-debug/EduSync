const fs = require('fs');
let css = fs.readFileSync('resources/css/app.css', 'utf8');

if (!css.includes('--animate-fade-in')) {
    css = css.replace('@theme {', `@theme {
    --animate-fade-in: fade-in 0.3s ease-out;
    --animate-fade-in-up: fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    --animate-slide-in: slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    
    @keyframes fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    @keyframes fade-in-up {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slide-in {
        from { opacity: 0; transform: translateX(15px); }
        to { opacity: 1; transform: translateX(0); }
    }
`);
    fs.writeFileSync('resources/css/app.css', css, 'utf8');
}
