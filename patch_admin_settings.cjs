const fs = require('fs');
let content = fs.readFileSync('resources/js/Pages/Admin/Settings.jsx', 'utf8');

// Add import
if (!content.includes('AvatarCropperModal')) {
    content = content.replace("import Toast from '@/Components/Toast';", "import Toast from '@/Components/Toast';\nimport AvatarCropperModal from '@/Components/AvatarCropperModal';");
}

// Add state for modal
if (!content.includes('const [cropModalOpen, setCropModalOpen] = useState(false);')) {
    content = content.replace("const [avatarFile, setAvatarFile] = useState(null);", "const [avatarFile, setAvatarFile] = useState(null);\n    const [cropModalOpen, setCropModalOpen] = useState(false);\n    const [tempAvatarUrl, setTempAvatarUrl] = useState(null);");
}

// Modify handleAvatarChange
const oldHandleAvatar = `    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };`;

const newHandleAvatar = `    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setTempAvatarUrl(URL.createObjectURL(file));
            setCropModalOpen(true);
            e.target.value = null; // reset input
        }
    };

    const handleCropComplete = (croppedFile, previewUrl) => {
        setAvatarFile(croppedFile);
        setAvatarPreview(previewUrl);
    };`;

content = content.replace(oldHandleAvatar, newHandleAvatar);

// Add the modal component at the end of the return statement before the last closing div
if (!content.includes('<AvatarCropperModal')) {
    const modalJSX = `
            <AvatarCropperModal
                isOpen={cropModalOpen}
                onClose={() => setCropModalOpen(false)}
                imageSrc={tempAvatarUrl}
                onCropCompleteCallback={handleCropComplete}
            />
        </AdminLayout>
    );`;
    content = content.replace("</AdminLayout>\n    );", modalJSX);
}

fs.writeFileSync('resources/js/Pages/Admin/Settings.jsx', content, 'utf8');
