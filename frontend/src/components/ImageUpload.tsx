import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  Camera,
  X,
  Image as ImageIcon,
  Leaf,
  AlertCircle,
} from 'lucide-react';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  onClear: () => void;
  selectedImage: string | null;
  isProcessing: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelect,
  onClear,
  selectedImage,
  isProcessing,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);
      const file = acceptedFiles[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file');
        return;
      }

      if (file.size > 16 * 1024 * 1024) {
        setError('Image size must be less than 16MB');
        return;
      }

      onImageSelect(file);
    },
    [onImageSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp'],
    },
    maxFiles: 1,
    disabled: isProcessing,
  });

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setIsCameraOpen(true);
    } catch {
      setError('Could not access camera. Please check permissions.');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(video, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], 'capture.jpg', {
                type: 'image/jpeg',
              });
              onImageSelect(file);
            }
          },
          'image/jpeg',
          0.9
        );
      }

      closeCamera();
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="w-full">

      {/* CAMERA MODE */}
      {isCameraOpen ? (
        <div className="relative">

          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-xl bg-black"
          />

          <canvas ref={canvasRef} className="hidden" />

          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">

            <button
              type="button"
              aria-label="Close camera"
              onClick={closeCamera}
              className="p-4 bg-red-500 hover:bg-red-600 rounded-full text-white transition-all"
            >
              <X size={24} />
            </button>

            <button
              type="button"
              aria-label="Capture photo"
              onClick={capturePhoto}
              className="p-4 bg-white hover:bg-gray-100 rounded-full text-gray-800 transition-all"
            >
              <Camera size={24} />
            </button>

          </div>
        </div>
      ) : selectedImage ? (

        /* IMAGE PREVIEW */
        <div className="image-preview-shell">
          <div className="image-preview-frame">
            <img
              src={selectedImage}
              alt="Selected plant leaf for disease detection"
              className="selected-leaf-image"
            />
            <div className="preview-label"><Leaf size={14} /> LEAF PHOTO</div>
            {!isProcessing && <button type="button" aria-label="Remove selected image" onClick={onClear} className="preview-remove"><X size={17} /></button>}
            {isProcessing && <div className="preview-processing"><div className="spinner w-10 h-10 mx-auto mb-3"></div><strong>Taking a closer look…</strong><span>Comparing leaf patterns</span></div>}
          </div>
          <div className="preview-caption"><span>Leaf photo selected</span></div>
        </div>
      ) : (

        /* UPLOAD AREA */
        <div
          {...getRootProps()}
          className={`image-dropzone ${isDragActive ? 'is-dragging' : ''} ${isProcessing ? 'is-processing' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="dropzone-content">
            <div className="upload-action-mark"><Upload size={21} strokeWidth={1.7} /></div>
            <div className="dropzone-copy"><h3>{isDragActive ? 'Drop your photo here' : 'Drop a leaf photo here'}</h3><p>or choose an image from your device</p><small><ImageIcon size={13} /> JPG, PNG or WEBP · up to 16 MB</small></div>
            <span className="browse-action">Choose photo</span>
          </div>
        </div>
      )}


      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3 text-red-700 dark:text-red-400">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

    </div>
  );
};

export default ImageUpload;
