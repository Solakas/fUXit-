import React, { useState, useCallback, useRef } from 'react';
import UploadIcon from './icons/UploadIcon';
import Spinner from './Spinner';
import type { ImageData } from '../types';

interface ImageUploaderProps {
  onAnalyze: (imageData: ImageData) => void;
  isLoading: boolean;
  clearError: () => void;
}

const fileToDataUrl = (file: File): Promise<ImageData> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            const [header, base64] = result.split(',');
            if (!header || !base64) {
                reject(new Error("Invalid file format"));
                return;
            }
            const mimeTypeMatch = header.match(/:(.*?);/);
            if (!mimeTypeMatch || !mimeTypeMatch[1]) {
                reject(new Error("Could not determine mime type"));
                return;
            }
            resolve({ url: result, base64, mimeType: mimeTypeMatch[1], filename: file.name });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};


const ImageUploader: React.FC<ImageUploaderProps> = ({ onAnalyze, isLoading, clearError }) => {
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (files: FileList | null) => {
    if (files && files[0]) {
      clearError();
      try {
        const imageData = await fileToDataUrl(files[0]);
        setSelectedImage(imageData);
      } catch(error) {
        console.error("Error processing file:", error);
      }
    }
  }, [clearError]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  }, []);
  
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    handleFileChange(e.dataTransfer.files);
  }, [handleFileChange]);

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  if (selectedImage) {
    return (
      <div className="w-full max-w-lg mx-auto bg-gray-800 rounded-lg p-6 shadow-xl flex flex-col items-center">
        <h2 className="text-xl font-semibold text-white mb-4">Image Preview</h2>
        <img src={selectedImage.url} alt="Selected preview" className="max-h-80 w-auto rounded-md object-contain mb-6 border-2 border-gray-600"/>
        <div className="flex space-x-4">
          <button
            onClick={() => setSelectedImage(null)}
            disabled={isLoading}
            className="px-6 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            Choose Another
          </button>
          <button
            onClick={() => onAnalyze(selectedImage)}
            disabled={isLoading}
            className="inline-flex items-center px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors"
          >
            {isLoading ? <><Spinner className="h-5 w-5 mr-2" /> Analyzing...</> : 'Analyze UI'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto">
        <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileSelect}
        className={`flex justify-center items-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${dragOver ? 'border-indigo-500 bg-gray-800' : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'}`}
        >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
            <UploadIcon className="w-10 h-10 mb-4 text-gray-400" />
            <p className="mb-2 text-sm text-gray-400">
            <span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, or WEBP</p>
        </div>
        <input ref={fileInputRef} type="file" id="dropzone-file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={(e) => handleFileChange(e.target.files)} />
        </div>
    </div>
  );
};

export default ImageUploader;
