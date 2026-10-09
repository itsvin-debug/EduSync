import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import Modal from '@/Components/Modal';

// Helper to extract the cropped image
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = 256;
  canvas.height = 256;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    256,
    256
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error('Canvas is empty');
        return;
      }
      blob.name = 'cropped_avatar.jpg';
      resolve(blob);
    }, 'image/jpeg', 0.95);
  });
}

export default function AvatarCropperModal({ isOpen, onClose, imageSrc, onCropCompleteCallback }) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleSave = async () => {
        try {
            const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            const croppedFile = new File([croppedImageBlob], "avatar.jpg", { type: "image/jpeg" });
            const previewUrl = URL.createObjectURL(croppedImageBlob);
            onCropCompleteCallback(croppedFile, previewUrl);
            onClose();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Crop Foto Profil" maxWidth="md">
            <div className="relative w-full h-[300px] bg-slate-900 rounded-xl overflow-hidden mb-4">
                {imageSrc && (
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                    />
                )}
            </div>
            <div className="flex flex-col gap-2 mb-6 px-2">
                <label className="text-xs font-medium text-slate-600">Zoom ({Math.round(zoom * 100)}%)</label>
                <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    onChange={(e) => setZoom(e.target.value)}
                    className="w-full accent-indigo-600"
                />
            </div>
            <div className="flex items-center justify-end gap-3 mt-4">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors duration-200 ease-bouncy active:scale-95"
                >
                    Batal
                </button>
                <button
                    onClick={handleSave}
                    className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors duration-200 ease-bouncy active:scale-95"
                >
                    Terapkan Crop
                </button>
            </div>
        </Modal>
    );
}
