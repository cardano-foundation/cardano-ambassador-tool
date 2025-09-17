'use client';

import Copyable from '@/components/Copyable';
import Button from '@/components/atoms/Button';
import { getCurrentNetworkConfig } from '@/config/cardano';
import { ExtendedMemberData } from '@types';
import { Edit, Save, X } from 'lucide-react';
import { useState } from 'react';

interface EditableMemberDataComponentProps {
  membershipData: ExtendedMemberData | null;
  onSave?: (updatedData: Partial<ExtendedMemberData>) => void;
  readonly?: boolean;
}

const MemberDataComponent = ({
  membershipData,
  onSave,
  readonly = false,
}: EditableMemberDataComponentProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    name: membershipData?.name ?? '',
    forum_username: membershipData?.forum_username ?? '',
    email: membershipData?.email ?? '',
    bio: membershipData?.bio ?? '',
  });

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData({
      name: membershipData?.name ?? '',
      forum_username: membershipData?.forum_username ?? '',
      email: membershipData?.email ?? '',
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
      name: membershipData?.name ?? '',
      forum_username: membershipData?.forum_username ?? '',
      email: membershipData?.email ?? '',
      bio: membershipData?.bio ?? '',
    });
  };

  const EditableField = ({
    label,
    value,
    editKey,
    multiline = false,
  }: {
    label: string;
    value: string;
    editKey: keyof typeof editedData;
    multiline?: boolean;
  }) => (
    <div className="flex gap-4">
      <span className="text-muted-foreground w-32">{label}:</span>
      <div className="ml-auto flex-1">
        {isEditing ? (
          multiline ? (
            <textarea
              value={editedData[editKey]}
              onChange={(e) =>
                setEditedData({ ...editedData, [editKey]: e.target.value })
              }
              className="border-border focus:ring-primary resize-vertical min-h-[80px] w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
              rows={3}
            />
          ) : (
            <input
              type={editKey === 'email' ? 'email' : 'text'}
              value={editedData[editKey]}
              onChange={(e) =>
                setEditedData({ ...editedData, [editKey]: e.target.value })
              }
              className="border-border focus:ring-primary w-full rounded-md border px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
            />
          )
        ) : (
          <span className={multiline ? 'whitespace-pre-wrap' : ''}>
            {value}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      {/* Header with edit button */}
      {!readonly && (
        <div className="mb-2 flex items-center justify-between">
          <div className="flex gap-2">
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
        value={membershipData?.name ?? ''}
        editKey="name"
      />

      <EditableField
        label="Display name"
        value={membershipData?.forum_username ?? ''}
        editKey="forum_username"
      />

      <EditableField
        label="Email"
        value={membershipData?.email ?? ''}
        editKey="email"
      />

      <EditableField
        label="Bio"
        value={membershipData?.bio ?? ''}
        editKey="bio"
        multiline
      />

      {/* Non-editable fields */}
      <div className="flex gap-4">
        <span className="text-muted-foreground w-32">Wallet:</span>
        <div className="flex-1">
          {membershipData?.address && (
            <Copyable
              withKey={false}
              value={membershipData.address}
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
