'use client';

import UserAvatar from '@/components/atoms/UserAvatar';
import { Camera } from 'lucide-react';
import { useRef } from 'react';

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
  className = '',
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
      className={`relative inline-flex cursor-pointer items-start justify-start gap-2.5 overflow-hidden rounded-[200px] ${className}`}
      onClick={handleClick}
    >
      {currentImage ? (
        <img
          className="border-primary-base h-20 w-20 rounded-[200px] border-2"
          src={currentImage}
          alt="Profile"
        />
      ) : (
        <UserAvatar size="size-20" name={userName} />
      )}

      <div className="absolute top-[60px] left-[-20px] flex h-5 w-30 items-center justify-center bg-neutral-900/50">
        <Camera className="text-white" />
      </div>
      <input
        ref={fileInputRef}
        type="file"
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
}
