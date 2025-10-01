'use client';

import { useRef } from 'react';
import { Camera } from 'lucide-react';
import UserAvatar from '@/components/atoms/UserAvatar'; 

interface ProfileImageEditorProps {
  currentImage?: string | null;
  onImageUpload: (file: File) => void;
  userName?: string;
  className?: string;
}

export default function ProfileImageEditor({
  currentImage,
  onImageUpload,
  userName = 'User',
  className = ''
}: ProfileImageEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div 
      className={`relative rounded-[200px] inline-flex justify-start items-start gap-2.5 overflow-hidden cursor-pointer ${className}`}
      onClick={handleClick}
    >
      {currentImage ? (
        <img 
          className="w-20 h-20 rounded-[200px] border-2 border-primary-base" 
          src={currentImage} 
          alt="Profile" 
        />
      ) : (
        <UserAvatar
          size="size-20"
          name={userName}
        />
      )}
      
      <div className="w-30 h-5 left-[-20px] top-[60px] absolute bg-neutral-900/50 flex items-center justify-center">
        <Camera className="text-white" />
      </div>
      <input
        ref={fileInputRef}
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
}