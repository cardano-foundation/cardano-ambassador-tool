'use client';

import { ImageUp } from 'lucide-react';
import { useState, useRef } from 'react';
import TextLink from './TextLink';

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
  onDisconnect: () => void;
  currentImage?: string | null;
  className?: string;
  maxSize?: number;
  acceptedTypes?: string[];
}

export default function ImageUpload({ 
  onImageUpload, 
  onDisconnect, 
  currentImage,
  className = '',
  maxSize = 5 * 1024 * 1024,
  acceptedTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/gif']
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    return acceptedTypes.includes(file.type) && file.size <= maxSize;
  };

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      onImageUpload(file);
    } else {
      console.error('Invalid file');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div 
      className={`
        self-stretch px-3 py-5 rounded-md border border-border 
        inline-flex justify-center items-center gap-2.5 relative 
        transition-colors duration-200
        ${isDragging ? 'border-primary-base bg-primary-50' : ''}
        ${currentImage ? 'min-h-[120px]' : ''}
        ${className}
      `}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {currentImage ? (
        <div className="w-full inline-flex flex-col justify-center items-center gap-5">
          <img 
            src={currentImage} 
            alt="Upload preview" 
            className="max-h-20 max-w-20 object-cover rounded"
          />
          <div className="inline-flex flex-col justify-center items-center gap-[5px]">
            <div className="inline-flex justify-center items-center gap-1.5">
              <button 
                onClick={onDisconnect}
                className="flex justify-start items-start gap-2.5"
                type="button"
              >
                <TextLink 
                  href="#" 
                  onClick={(e) => e.preventDefault()}
                  className="pb-[5px] border-b border-rose-500 no-underline hover:no-underline font-['Chivo']"
                  size="sm"
                >
                  Disconnect
                </TextLink>
              </button>
              <div className="text-center text-neutral-500 text-sm font-normal font-['Chivo'] leading-none">
                or drag and drop
              </div>
            </div>
            <div className="text-center text-neutral-500 text-sm font-normal font-['Chivo'] leading-none">
              SVG, PNG, JPG or GIF (max. 800x400px)
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full inline-flex flex-col justify-center items-center gap-5">
          <ImageUp className="w-11 h-11 text-muted-foreground" />
          <div className="text-center space-y-1">
            <div className="text-sm text-neutral-600">
              Click to upload or drag and drop
            </div>
            <div className="text-xs text-neutral-500">
              SVG, PNG, JPG or GIF (max. 5MB)
            </div>
          </div>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        accept={acceptedTypes.join(',')}
        onChange={handleFileChange}
      />
    </div>
  );
}