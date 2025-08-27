"use client";
import { TableTestPage } from '../_components/TableTestPage';
import GithubIcon from '@/components/atoms/GithubIcon';
import LinkedInIcon from '@/components/atoms/LinkedinIcon';
import XIcon from '@/components/atoms/XIcon';

export default function Home() {
  return (
    <div>
      <TableTestPage />
      <div className="flex gap-4 p-4">
        <GithubIcon size={24} className="rounded hover:text-gray-600 cursor-pointer" />
        <LinkedInIcon size={24} color="#0077B5" className="hover:opacity-80 cursor-pointer rounded" />
        <XIcon size={24} className="hover:text-gray-600 cursor-pointer" />
      </div>
    </div>
  );
}