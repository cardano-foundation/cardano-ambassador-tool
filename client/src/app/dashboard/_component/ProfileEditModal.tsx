'use client';
import Button from '@/components/atoms/Button';
import ForumUsernameInput from '@/components/atoms/ForumUsernameInput';
import Input from '@/components/atoms/Input';
import Modal from '@/components/atoms/Modal';
import TextArea from '@/components/atoms/TextArea';
import Title from '@/components/atoms/Title';
import UserAvatar from '@/components/atoms/UserAvatar';
import ErrorAccordion from '@/components/ErrorAccordion';
import LocationSelector from '@/app/(onboarding)/sign-up/components/LocationSelector';
import { getCountryByCode, getCountryByName } from '@/utils/locationData';
import {
  getFieldError,
  validateProfileForm,
  ValidationError,
} from '@/utils/validation';
import { useEffect, useState } from 'react';

interface ProfileEditModalProps {
  isOpen: boolean;
  profile: {
    name: string;
    username: string;
    email: string;
    bio?: string;
    country?: string;
    city?: string;
    spoId?: string;
    github?: string;
    twitter?: string;
    discord?: string;
  };
  onClose: () => void;
  onSave: (profile: any) => Promise<void>;
}

export default function ProfileEditModal({
  isOpen,
  profile,
  onClose,
  onSave,
}: ProfileEditModalProps) {
  const [formData, setFormData] = useState(profile);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countryCode, setCountryCode] = useState('');
  
  // Validation and error state
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [submitError, setSubmitError] = useState<{
    message: string;
    details?: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(profile);
      setValidationErrors([]);
      setSubmitError(null);
      setIsSubmitting(false);
      
      if (profile.country) {
        let foundCountry = getCountryByCode(profile.country);
        if (!foundCountry) {
          foundCountry = getCountryByName(profile.country);
        }
        
        if (foundCountry) {
          setCountryCode(foundCountry.code);
        } else {
          setCountryCode(profile.country);
        }
      } else {
        setCountryCode('');
      }
    }
  }, [isOpen, profile]);

  // Clear submit error when form data changes
  useEffect(() => {
    if (submitError) {
      setSubmitError(null);
    }
  }, [formData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCountryChange = (newCountryCode: string) => {
    setCountryCode(newCountryCode);
    const country = getCountryByCode(newCountryCode);
    setFormData(prev => ({
      ...prev,
      country: country?.name || '',
      city: prev.country !== country?.name ? '' : prev.city
    }));
  };

  const handleCityChange = (newCity: string) => {
    setFormData(prev => ({
      ...prev,
      city: newCity
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setValidationErrors([]);
    setSubmitError(null);
    
    const validation = validateProfileForm({
      name: formData.name,
      username: formData.username,
      email: formData.email,
      bio: formData.bio,
      country: formData.country,
      city: formData.city,
      github: formData.github,
      twitter: formData.twitter,
      discord: formData.discord,
      spoId: formData.spoId,
    });
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      const firstError = validation.errors[0];
      const errorElement = document.querySelector(
        `[name="${firstError.field}"]`,
      ) as HTMLElement;
      if (errorElement) {
        errorElement.focus();
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSave(formData);
    } catch (error: any) {
      console.error('Failed to save profile:', error);
      setSubmitError({
        message: error?.message || 'Failed to update profile. Please try again.',
        details: error?.stack || JSON.stringify(error, null, 2)
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Profile"
      size="2xl"
      closable={!isSubmitting}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Accordion */}
        <ErrorAccordion
          isVisible={!!submitError}
          message={submitError?.message}
          details={submitError?.details}
          onDismiss={() => setSubmitError(null)}
        />
        {/* Profile Photo */}
        <div className="flex items-center gap-4">
          <div className="border-primary-base relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2">
            <UserAvatar size="size-20" name={formData.name} />
          </div>
          <div>
            <Title level="6" className="text-neutral mb-1">
              Profile Photo
            </Title>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-primary-base!">
              Change Photo
            </Button>
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="text-foreground mb-2 block text-sm font-medium">
              Full Name *
            </label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter your full name"
              required
              error={!!getFieldError(validationErrors, 'name')}
              errorMessage={getFieldError(validationErrors, 'name')}
            />
          </div>

          <div className="space-y-1">
            <ForumUsernameInput
              label="Forum Username (Display Name) *"
              placeholder="Enter your forum.cardano.org username"
              value={formData.username}
              onChange={(username) => handleInputChange('username', username)}
            />
            {getFieldError(validationErrors, 'username') && (
              <p className="text-primary-base mt-1 text-sm">
                {getFieldError(validationErrors, 'username')}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="text-foreground mb-2 block text-sm font-medium">
            Email Address *
          </label>
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter your email address"
            required
            error={!!getFieldError(validationErrors, 'email')}
            errorMessage={getFieldError(validationErrors, 'email')}
          />
        </div>

        {/* Location Selector */}
        <div className="space-y-1">
          <LocationSelector
            countryCode={countryCode}
            city={formData.city}
            onCountryChange={handleCountryChange}
            onCityChange={handleCityChange}
          />
          {(getFieldError(validationErrors, 'country') ||
            getFieldError(validationErrors, 'city')) && (
            <p className="text-primary-base mt-1 text-sm">
              {getFieldError(validationErrors, 'country') ||
                getFieldError(validationErrors, 'city')}
            </p>
          )}
        </div>

        <div>
          <label className="text-foreground mb-2 block text-sm font-medium">
            Bio
          </label>
          <TextArea
            name="bio"
            value={formData.bio || ''}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder="Tell us about yourself..."
            rows={4}
            className="resize-none"
            error={!!getFieldError(validationErrors, 'bio')}
            errorMessage={getFieldError(validationErrors, 'bio')}
          />
        </div>

        {/* Social Links */}
        <div className="space-y-4">
          <Title level="6" className="text-neutral">
            Social Links
          </Title>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-foreground mb-2 block text-sm font-medium">
                GitHub Username
              </label>
              <Input
                type="text"
                name="github"
                value={formData.github || ''}
                onChange={(e) => handleInputChange('github', e.target.value)}
                placeholder="GitHub username"
                error={!!getFieldError(validationErrors, 'github')}
                errorMessage={getFieldError(validationErrors, 'github')}
              />
            </div>

            <div>
              <label className="text-foreground mb-2 block text-sm font-medium">
                Twitter/X Handle
              </label>
              <Input
                type="text"
                name="twitter"
                value={formData.twitter || ''}
                onChange={(e) => handleInputChange('twitter', e.target.value)}
                placeholder="Twitter handle (without @)"
                error={!!getFieldError(validationErrors, 'twitter')}
                errorMessage={getFieldError(validationErrors, 'twitter')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-foreground mb-2 block text-sm font-medium">
                Discord Username
              </label>
              <Input
                type="text"
                name="discord"
                value={formData.discord || ''}
                onChange={(e) => handleInputChange('discord', e.target.value)}
                placeholder="Discord username"
                error={!!getFieldError(validationErrors, 'discord')}
                errorMessage={getFieldError(validationErrors, 'discord')}
              />
            </div>

            <div>
              <label className="text-foreground mb-2 block text-sm font-medium">
                SPO ID
              </label>
              <Input
                type="text"
                name="spoId"
                value={formData.spoId || ''}
                onChange={(e) => handleInputChange('spoId', e.target.value)}
                placeholder="Stake Pool Operator ID"
                error={!!getFieldError(validationErrors, 'spoId')}
                errorMessage={getFieldError(validationErrors, 'spoId')}
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-primary-base!"
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}