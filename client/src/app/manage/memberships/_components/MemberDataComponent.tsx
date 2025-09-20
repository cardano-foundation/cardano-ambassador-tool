'use client';

import Copyable from '@/components/Copyable';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import TextArea from '@/components/atoms/TextArea';
import { getCurrentNetworkConfig } from '@/config/cardano';
import { fetchTransactionTimestamp, formatTimestamp } from '@/utils';
import { ExtendedMemberData } from '@types';
import { Edit, Save, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface EditableMemberDataComponentProps {
  membershipData: ExtendedMemberData | null;
  onSave?: (updatedData: Partial<ExtendedMemberData>) => void;
  readonly?: boolean;
}

type EditedData = {
  fullName: string;
  displayName: string;
  emailAddress: string;
  bio: string;
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
  const [editedData, setEditedData] = useState<EditedData>({
    fullName: membershipData?.fullName ?? '',
    displayName: membershipData?.displayName ?? '',
    emailAddress: membershipData?.emailAddress ?? '',
    bio: membershipData?.bio ?? '',
  });

  const [submissionTimestamp, setSubmissionTimestamp] = useState<Date | null>(
    null,
  );
  const [isLoadingTimestamp, setIsLoadingTimestamp] = useState(false);

  const handleFieldChange = useCallback(
    (key: keyof EditedData, value: string) => {
      setEditedData((prev) => {
        const newData = { ...prev, [key]: value };
        return newData;
      });
    },
    [],
  );

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData({
      fullName: membershipData?.fullName ?? '',
      displayName: membershipData?.displayName ?? '',
      emailAddress: membershipData?.emailAddress ?? '',
      bio: membershipData?.bio ?? '',
    });
  };

  const handleSave = () => {
    if (onSave) {
      onSave(editedData);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData({
      fullName: membershipData?.fullName ?? '',
      displayName: membershipData?.displayName ?? '',
      emailAddress: membershipData?.emailAddress ?? '',
      bio: membershipData?.bio ?? '',
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
                  className="flex items-center gap-1"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSave}
                  className="flex items-center gap-1"
                >
                  <Save className="h-4 w-4" />
                  Save
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="flex items-center gap-1"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Editable Fields */}
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

      <EditableField
        label="Bio"
        value={membershipData?.bio ?? ''}
        editKey="bio"
        editedData={editedData}
        isEditing={isEditing}
        type="bio"
        onChange={handleFieldChange}
      />

      {/* Non-editable fields */}
      <div className="flex gap-4">
        <span className="text-muted-foreground w-32">Wallet:</span>
        <div className="flex-1">
          {membershipData?.walletAddress && (
            <Copyable
              withKey={false}
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
  );
};

export default MemberDataComponent;
