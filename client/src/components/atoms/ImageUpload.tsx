'use client';

import { ImageUp } from 'lucide-react';
import { useRef, useState } from 'react';
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
  acceptedTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/gif'],
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
      className={`border-border relative inline-flex items-center justify-center gap-2.5 self-stretch rounded-md border px-3 py-5 transition-colors duration-200 ${isDragging ? 'border-primary-base bg-primary-50' : ''} ${currentImage ? 'min-h-[120px]' : ''} ${className} `}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {currentImage ? (
        <div className="inline-flex w-full flex-col items-center justify-center gap-5">
          <img
            src={currentImage}
            alt="Upload preview"
            className="max-h-20 max-w-20 rounded object-cover"
          />
          <div className="inline-flex flex-col items-center justify-center gap-[5px]">
            <div className="inline-flex items-center justify-center gap-1.5">
              <button
                onClick={onDisconnect}
                className="flex items-start justify-start gap-2.5"
                type="button"
              >
                <TextLink
                  href="#"
                  variant="dotted"
                  onClick={(e) => e.preventDefault()}
                  // className="pb-[5px] border-b border-rose-500 no-underline hover:no-underline font-['Chivo']"
                  size="sm"
                >
                  Disconnect
                </TextLink>
              </button>
              <div className="text-center font-['Chivo'] text-sm leading-none font-normal text-neutral-500">
                or drag and drop
              </div>
            </div>
            <div className="text-center font-['Chivo'] text-sm leading-none font-normal text-neutral-500">
              SVG, PNG, JPG or GIF (max. 800x400px)
            </div>
          </div>
        </div>
      ) : (
        <div className="inline-flex w-full flex-col items-center justify-center gap-5">
          <ImageUp className="text-muted-foreground h-11 w-11" />
          <div className="space-y-1 text-center">
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
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        accept={acceptedTypes.join(',')}
        onChange={handleFileChange}
      />
    </div>
  );
}
