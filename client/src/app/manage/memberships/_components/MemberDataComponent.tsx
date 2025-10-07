'use client';

import LocationSelector from '@/app/(onboarding)/sign-up/components/LocationSelector';
import Button from '@/components/atoms/Button';
import ForumUsernameInput from '@/components/atoms/ForumUsernameInput';
import Input from '@/components/atoms/Input';
import TextArea from '@/components/atoms/TextArea';
import Copyable from '@/components/Copyable';
import ErrorAccordion from '@/components/ErrorAccordion';
import { getCurrentNetworkConfig } from '@/config/cardano';
import { fetchTransactionTimestamp, formatTimestamp } from '@/utils';
import { getCountryByCode } from '@/utils/locationData';
import {
  getFieldError,
  validateIntentForm,
  ValidationError,
} from '@/utils/validation';
import { ExtendedMemberData } from '@types';
import { Edit, Save, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface EditableMemberDataComponentProps {
  membershipData: ExtendedMemberData | null;
  onSave?: (updatedData: Partial<ExtendedMemberData>) => Promise<void>;
  readonly?: boolean;
}

type EditedData = {
  fullName: string;
  displayName: string;
  emailAddress: string;
  bio: string;
  country: string;
  city: string;
};

const EditableField = ({
  label,
  value,
  editKey,
  editedData,
  isEditing,
  type = 'text',
  onChange,
}: {
  label: string;
  value: string;
  editKey: keyof EditedData;
  editedData: EditedData;
  isEditing: boolean;
  type?: 'text' | 'email' | 'bio';
  onChange: (key: keyof EditedData, value: string) => void;
}) => {
  if (!isEditing) {
    return (
      <div className="flex items-start gap-4">
        <span className="text-muted-foreground w-32 pt-2">{label}:</span>
        <div className="flex-1">
          <span
            className={
              type === 'bio' ? 'block pt-2 whitespace-pre-wrap' : 'block pt-2'
            }
          >
            {value}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {type === 'bio' ? (
        <TextArea
          label={label}
          rows={3}
          value={editedData[editKey]}
          onChange={(e) => onChange(editKey, e.target.value)}
        />
      ) : (
        <Input
          label={label}
          type={type}
          value={editedData[editKey]}
          onChange={(e) => onChange(editKey, e.target.value)}
        />
      )}
    </div>
  );
};

const MemberDataComponent = ({
  membershipData,
  onSave,
  readonly = false,
}: EditableMemberDataComponentProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editedData, setEditedData] = useState<EditedData>({
    fullName: membershipData?.fullName ?? '',
    displayName: membershipData?.displayName ?? '',
    emailAddress: membershipData?.emailAddress ?? '',
    bio: membershipData?.bio ?? '',
    country: membershipData?.country ?? '',
    city: membershipData?.city ?? '',
  });
  const [hasChanges, setHasChanges] = useState(false);

  // Validation and error state
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    [],
  );
  const [submitError, setSubmitError] = useState<{
    message: string;
    details?: string;
  } | null>(null);

  const [submissionTimestamp, setSubmissionTimestamp] = useState<Date | null>(
    null,
  );
  const [isLoadingTimestamp, setIsLoadingTimestamp] = useState(false);

  // Helper function to check if edited data differs from original
  const checkForChanges = useCallback(
    (data: EditedData) => {
      if (!membershipData) return false;

      return (
        data.fullName !== (membershipData.fullName ?? '') ||
        data.displayName !== (membershipData.displayName ?? '') ||
        data.emailAddress !== (membershipData.emailAddress ?? '') ||
        data.bio !== (membershipData.bio ?? '') ||
        data.country !== (membershipData.country ?? '') ||
        data.city !== (membershipData.city ?? '')
      );
    },
    [membershipData],
  );

  const handleFieldChange = useCallback(
    (key: keyof EditedData, value: string) => {
      setEditedData((prev) => {
        const newData = { ...prev, [key]: value };
        setHasChanges(checkForChanges(newData));
        return newData;
      });
    },
    [checkForChanges],
  );

  const handleEdit = () => {
    setIsEditing(true);
    setValidationErrors([]);
    setSubmitError(null);
    setHasChanges(false);
    setEditedData({
      fullName: membershipData?.fullName ?? '',
      displayName: membershipData?.displayName ?? '',
      emailAddress: membershipData?.emailAddress ?? '',
      bio: membershipData?.bio ?? '',
      country: membershipData?.country ?? '',
      city: membershipData?.city ?? '',
    });
  };

  const handleSave = async () => {
    // Clear previous errors
    setValidationErrors([]);
    setSubmitError(null);

    // Validate form data (excluding t_c since it's not needed for updates)
    const validation = validateIntentForm({
      fullName: editedData.fullName,
      email: editedData.emailAddress,
      forum_username: editedData.displayName,
      country: editedData.country,
      city: editedData.city,
      bio: editedData.bio,
      t_c: true,
    });

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      // Focus on the first error field
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

    if (onSave) {
      setIsSubmitting(true);
      try {
        await onSave(editedData);
        setIsEditing(false);
        setHasChanges(false);
      } catch (error) {
        setSubmitError({
          message: 'Update failed',
          details: error instanceof Error ? error.stack : String(error),
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setValidationErrors([]);
    setSubmitError(null);
    setHasChanges(false);
    setEditedData({
      fullName: membershipData?.fullName ?? '',
      displayName: membershipData?.displayName ?? '',
      emailAddress: membershipData?.emailAddress ?? '',
      bio: membershipData?.bio ?? '',
      country: membershipData?.country ?? '',
      city: membershipData?.city ?? '',
    });
  };

  // Function to fetch transaction timestamp
  const fetchTransactionTime = async (txHash: string) => {
    try {
      setIsLoadingTimestamp(true);

      setSubmissionTimestamp(await fetchTransactionTimestamp(txHash));
    } catch (error) {
      console.error('Error fetching transaction timestamp:', error);
    } finally {
      setIsLoadingTimestamp(false);
    }
  };

  useEffect(() => {
    if (membershipData?.txHash) {
      fetchTransactionTime(membershipData.txHash!);
    }
  }, [membershipData]);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Error Accordion */}
      <ErrorAccordion
        isVisible={!!submitError}
        message={submitError?.message}
        details={submitError?.details}
        onDismiss={() => setSubmitError(null)}
      />

      <div className="flex max-w-2xl flex-col gap-4">
        {/* Header with edit button */}
        {!readonly && (
          <div className="mb-2 flex items-center justify-between">
            <span className="text-muted-foreground text-sm font-normal">
              {isLoadingTimestamp ? (
                'Loading...'
              ) : submissionTimestamp ? (
                <>{formatTimestamp(submissionTimestamp)}</>
              ) : (
                'Recently'
              )}
            </span>
            <div className="ml-auto flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    className="text-primary-base! flex items-center gap-1"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSave}
                    disabled={isSubmitting || !hasChanges}
                    className="flex items-center gap-1"
                  >
                    <Save className="h-4 w-4" />
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="text-primary-base! flex items-center gap-1"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Editable Fields */}
        {isEditing ? (
          <div className="w-full space-y-6">
            <Input
              label="Full Name"
              placeholder="Lovelace"
              type="text"
              name="fullName"
              value={editedData.fullName}
              onChange={(e) => handleFieldChange('fullName', e.target.value)}
              error={!!getFieldError(validationErrors, 'fullName')}
              errorMessage={getFieldError(validationErrors, 'fullName')}
            />

            <Input
              label="Email Address"
              placeholder="john.doe@example.com"
              type="email"
              name="email"
              value={editedData.emailAddress}
              onChange={(e) =>
                handleFieldChange('emailAddress', e.target.value)
              }
              error={!!getFieldError(validationErrors, 'email')}
              errorMessage={getFieldError(validationErrors, 'email')}
            />

            <div className="space-y-1">
              <ForumUsernameInput
                value={editedData.displayName}
                onChange={(displayName) =>
                  handleFieldChange('displayName', displayName)
                }
              />
              {getFieldError(validationErrors, 'forum_username') && (
                <p className="text-primary-base mt-1 text-sm">
                  {getFieldError(validationErrors, 'forum_username')}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <LocationSelector
                countryCode={editedData.country}
                city={editedData.city}
                onCountryChange={(country) => {
                  handleFieldChange('country', country);
                  handleFieldChange('city', ''); // Reset city when country changes
                }}
                onCityChange={(city) => handleFieldChange('city', city)}
              />
              {(getFieldError(validationErrors, 'country') ||
                getFieldError(validationErrors, 'city')) && (
                <p className="text-primary-base mt-1 text-sm">
                  {getFieldError(validationErrors, 'country') ||
                    getFieldError(validationErrors, 'city')}
                </p>
              )}
            </div>

            <TextArea
              label="Bio"
              rows={4}
              name="bio"
              value={editedData.bio}
              onChange={(e) => handleFieldChange('bio', e.target.value)}
              error={!!getFieldError(validationErrors, 'bio')}
              errorMessage={getFieldError(validationErrors, 'bio')}
            />
          </div>
        ) : (
          <>
            <EditableField
              label="Full name"
              value={membershipData?.fullName ?? ''}
              editKey="fullName"
              editedData={editedData}
              isEditing={isEditing}
              type="text"
              onChange={handleFieldChange}
            />

            <EditableField
              label="Display name"
              value={membershipData?.displayName ?? ''}
              editKey="displayName"
              editedData={editedData}
              isEditing={isEditing}
              type="text"
              onChange={handleFieldChange}
            />

            <EditableField
              label="Email"
              value={membershipData?.emailAddress ?? ''}
              editKey="emailAddress"
              editedData={editedData}
              isEditing={isEditing}
              type="email"
              onChange={handleFieldChange}
            />

            <div className="flex items-start gap-4">
              <span className="text-muted-foreground w-32 pt-2">Country:</span>
              <div className="flex-1">
                <span className="block pt-2">
                  {membershipData?.country
                    ? getCountryByCode(membershipData.country)?.name ??
                      membershipData.country
                    : ''}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="text-muted-foreground w-32 pt-2">City:</span>
              <div className="flex-1">
                <span className="block pt-2">{membershipData?.city ?? ''}</span>
              </div>
            </div>

            <EditableField
              label="Bio"
              value={membershipData?.bio ?? ''}
              editKey="bio"
              editedData={editedData}
              isEditing={isEditing}
              type="bio"
              onChange={handleFieldChange}
            />
          </>
        )}

        {/* Non-editable fields */}
        <div className="flex gap-4">
          <span className="text-muted-foreground w-32">Wallet:</span>
          <div className="flex-1">
            {membershipData?.walletAddress && (
              <Copyable
                withKey={false}
                link={`${getCurrentNetworkConfig().explorerUrl}/address/${membershipData.txHash}`}
                value={membershipData.walletAddress}
                keyLabel={''}
              />
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <span className="text-muted-foreground w-32">Tx Hash:</span>
          <div className="flex-1">
            {membershipData?.txHash && (
              <Copyable
                withKey={false}
                link={`${getCurrentNetworkConfig().explorerUrl}/transaction/${membershipData.txHash}`}
                value={membershipData.txHash}
                keyLabel={''}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDataComponent;
