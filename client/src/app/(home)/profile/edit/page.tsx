'use client';

import { useState } from 'react';
import Title from '@/components/atoms/Title';
import { Mail } from 'lucide-react';
import { useApp } from '@/context';
import SimpleCardanoLoader from '@/components/SimpleCardanoLoader';
import LocationSelector from '@/app/(onboarding)/sign-up/components/LocationSelector';
import Input from '@/components/atoms/Input';
import TextArea from '@/components/atoms/TextArea';
import Paragraph from '@/components/atoms/Paragraph';
import Button from '@/components/atoms/Button';
import ImageUpload from '@/components/atoms/ImageUpload';
import ProfileImageEditor from '@/components/atoms/ProfileImageEditor';
import CountrySelector from './CountrySelector';
import { ProfileFormData } from '@/types/Profile';

export default function EditProfile() {
  const [formData, setFormData] = useState<ProfileFormData>({
    name: 'Preston Odep',
    email: 'benjamin.baani@baani.com',
    displayName: 'Pres',
    country: '',
    city: '',
    claimUrl: 'baani',
    bio: 'I am Benjamin Baani from Ghana. I am a Blockchain Enthusiast, Cardano Events Organizer and Speaker. In Project Catalyst, I have served as a Proposal Assessor, Veteran Proposal Assessor, Challenge Team Member from Fund 8 to Fund 9, Voter, Team Lead for Startups & Onboarding for Students Challenge Team in Fund 10, Group E Proof of Life (PoL) Verifiers Team Lead in Fund 11. I am an agent of scaling up Cardano adoption in Ghana.',
    wallet: '',
    drep: '',
    poolId: '',
    github: '',
    twitter: '',
    discord: ''
  });

  const [avatar, setAvatar] = useState<string | null>(null);
  const { isAuthenticated } = useApp();
  
  if (!isAuthenticated) {
    return <SimpleCardanoLoader />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name as keyof ProfileFormData]: value }));
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDisconnect = () => {
    setAvatar(null);
  };

  const handleSave = () => {
    console.log('Name:', formData.name);
    console.log('Email:', formData.email);
    console.log('Country:', formData.country);
    console.log('Bio length:', formData.bio.length);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8 ">
          <Title level="5" className="mb-2">Personal info</Title>
          <Paragraph size="sm" className="text-foreground mb-6">
            Update your photo and personal details here
          </Paragraph>
        <div className="mb-12 border border-border rounded-lg p-6">

          <div className="space-y-6">
            <Input
              label="Full name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />

            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              icon={<Mail size={20} />}
            />

              <Input
                label="Display name"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
              />

            <TextArea
              label="Bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={6}
              className="text-base font-normal"
            />

            {/* <div className="grid grid-cols-2 gap-4"> */}

            <LocationSelector
              countryCode={formData.country}
              city={formData.city}
              onCountryChange={(country) => {
              setFormData((prev) => ({ ...prev, country, city: '' }));
            }}
            onCityChange={(city) => {
              setFormData((prev) => ({ ...prev, city }));
            }}
              className="grid grid-cols-2 gap-4"
            />
            {/* </div> */}

            {/* Avatar Upload */}
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <ProfileImageEditor
                  currentImage={avatar}
                  onImageUpload={handleImageUpload}
                  userName={formData.name}
                />
              </div>

              <ImageUpload
                onImageUpload={(file) => {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setAvatar(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                }}
                onDisconnect={handleDisconnect}
                currentImage={avatar}
                className="flex-1"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" size="sm">Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleSave}>
                Save changes
              </Button>
            </div>
          </div>
        </div>
        <div>
          <Title level="5" className="mb-2">Personal info</Title>
          <Paragraph size="sm" className="text-foreground mb-6">
            Update your social handles
          </Paragraph>

          <div className="space-y-6 border border-border rounded-lg p-6">
            <Input
              label="Claim url"
              name="claimUrl"
              value={formData.claimUrl}
              onChange={handleInputChange}
              prefix="https://ambasadorsexplorer.com/"
              placeholder="baani"
            />

            <Input
              label="Drep ID"
              name="drep"
              placeholder="https://github.com/yourusername"
              value={formData.drep}
              onChange={handleInputChange}
            />

            <Input
              label="Pool ID"
              name="poolId"
              placeholder="https://github.com/yourusername"
              value={formData.poolId}
              onChange={handleInputChange}
            />

            <Input
              label="Connect github"
              name="github"
              placeholder="https://github.com/yourusername"
              value={formData.github}
              onChange={handleInputChange}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Twitter handle"
                name="twitter"
                placeholder="@yourhandle"
                value={formData.twitter}
                onChange={handleInputChange}
              />

              <Input
                label="Discord"
                name="discord"
                placeholder="@yourhandle"
                value={formData.discord}
                onChange={handleInputChange}
              />
            </div>

            <div className="flex justify-end gap-3 ">
              <Button variant="outline" size="sm" >Cancel</Button>
              <Button variant="primary"  size="sm" onClick={handleSave}>
                Save changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}