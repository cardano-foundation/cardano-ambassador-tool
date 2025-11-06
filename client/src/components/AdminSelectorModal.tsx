import { useApp } from '@/context';
import { findAdminsFromOracle } from '@/lib/auth/roles';
import { shortenString } from '@/utils';
import { deserializeAddress } from '@meshsdk/core';
import { User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Button from './atoms/Button';
import Checkbox from './atoms/Checkbox';
import Modal from './atoms/Modal';
import Copyable from './Copyable';

interface AdminInfo {
  pubKeyHash: string;
  displayName: string;
  isSelected: boolean;
  isCurrentUser: boolean;
  disabled: boolean;
}

interface AdminSelectorModalProps {
  isVisible: boolean;
  onConfirm: (selectedAdmins: string[]) => void;
  onCancel: () => void;
  decision: 'approve' | 'reject';
}

const AdminSelectorModal: React.FC<AdminSelectorModalProps> = ({
  isVisible,
  onConfirm,
  onCancel,
  decision,
}) => {
  const [admins, setAdmins] = useState<AdminInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [minRequiredSigners, setMinRequiredSigners] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { wallet: walletState } = useApp();

  useEffect(() => {
    const loadAdmins = async () => {
      try {
        setLoading(true);
        setError(null);

        const adminData = await findAdminsFromOracle();

        if (!adminData || !adminData.adminPubKeyHashes) {
          throw new Error('Failed to load admin data from oracle');
        }

        // Get current user's public key hash
        let currentUserPubKeyHash: string | null = null;
        if (walletState?.wallet) {
          try {
            const wallet = await walletState.wallet;
            const currentAddress = await wallet.getChangeAddress();
            currentUserPubKeyHash =
              deserializeAddress(currentAddress).pubKeyHash;
          } catch (err) {
            console.warn('Could not get current user pub key hash:', err);
          }
        }

        const adminList: AdminInfo[] = adminData.adminPubKeyHashes.map(
          (pubKeyHash) => {
            const isCurrentUser = pubKeyHash === currentUserPubKeyHash;
            return {
              pubKeyHash,
              displayName: shortenString(pubKeyHash, 6),
              isSelected: isCurrentUser,
              isCurrentUser,
              disabled: isCurrentUser,
            };
          },
        );

        setAdmins(adminList);
        setMinRequiredSigners(Number(adminData.minsigners));
      } catch (err) {
        console.error('Error loading admins:', err);
        setError(err instanceof Error ? err.message : 'Failed to load admins');
      } finally {
        setLoading(false);
      }
    };

    if (isVisible) {
      loadAdmins();
    }
  }, [isVisible, walletState]);

  const toggleAdminSelection = (pubKeyHash: string) => {
    setAdmins((prev) =>
      prev.map((admin) =>
        admin.pubKeyHash === pubKeyHash && !admin.disabled
          ? { ...admin, isSelected: !admin.isSelected }
          : admin,
      ),
    );
  };

  const selectedCount = admins.filter((admin) => admin.isSelected).length;
  const canConfirm = selectedCount >= minRequiredSigners;

  const handleConfirm = () => {
    const selectedAdmins = admins
      .filter((admin) => admin.isSelected)
      .map((admin) => admin.pubKeyHash);

    onConfirm(selectedAdmins);
  };

  const handleSelectAll = () => {
    setAdmins((prev) =>
      prev.map((admin) => ({
        ...admin,
        isSelected: true,
      })),
    );
  };

  const handleSelectMinimum = () => {
    setAdmins((prev) => {
      const updated = [...prev];
      let selectedSoFar = 0;

      updated.forEach((admin) => {
        if (admin.disabled && admin.isSelected) {
          selectedSoFar++;
        }
      });

      for (
        let i = 0;
        i < updated.length && selectedSoFar < minRequiredSigners;
        i++
      ) {
        if (!updated[i].disabled) {
          if (selectedSoFar < minRequiredSigners) {
            updated[i].isSelected = true;
            selectedSoFar++;
          } else {
            updated[i].isSelected = false;
          }
        }
      }

      return updated;
    });
  };

  const handleClearSelectable = () => {
    setAdmins((prev) =>
      prev.map((admin) => ({
        ...admin,
        isSelected: admin.disabled ? admin.isSelected : false,
      })),
    );
  };

  const modalContent = loading ? (
    <div className="py-8 text-center">
      <div className="border-primary-base mx-auto h-8 w-8 animate-spin rounded-full border-b-2"></div>
      <p className="mt-2 ">Loading admins...</p>
    </div>
  ) : error ? (
    <div className="py-8 text-center">
      <div className="text-primary-base mb-2">⚠️ Error</div>
      <p className="">{error}</p>
    </div>
  ) : (
    <div className="space-y-4">
      {/* Requirements Info */}
      <div className="bg-muted border-border rounded-lg border p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-foreground">
            <strong>Minimum required:</strong> {minRequiredSigners} signature
            {minRequiredSigners !== 1 ? 's' : ''}
          </span>
          <span
            className={`font-medium ${canConfirm ? 'text-primary' : 'text-muted-foreground'}`}
          >
            Selected: {selectedCount} / {admins.length}
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" size="sm" onClick={handleSelectMinimum}>
          Select Min ({minRequiredSigners})
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-primary-base!"
          onClick={handleSelectAll}
        >
          Select All
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearSelectable}
          className="text-primary-base!"
        >
          Clear Others
        </Button>
      </div>

      {/* Admin List */}
      <div className="bg-background border-border max-h-60 overflow-hidden rounded-md border">
        <div className="max-h-60 overflow-y-auto py-1">
          {admins.map((admin) => (
            <button
              key={admin.pubKeyHash}
              type="button"
              onClick={
                !admin.disabled
                  ? () => toggleAdminSelection(admin.pubKeyHash)
                  : undefined
              }
              disabled={admin.disabled}
              className={`flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors ${
                admin.isSelected
                  ? 'bg-primary/10 text-primary border-l-primary-base border-l-2'
                  : 'text-foreground hover:bg-muted'
              } ${
                admin.disabled
                  ? 'cursor-not-allowed opacity-75 hover:bg-transparent'
                  : ''
              }`}
            >
              <div onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={admin.isSelected}
                  onCheckedChange={() =>
                    !admin.disabled && toggleAdminSelection(admin.pubKeyHash)
                  }
                  disabled={admin.disabled}
                  id={`admin-${admin.pubKeyHash}`}
                />
              </div>

              <User className="text-muted-foreground h-4 w-4 flex-shrink-0" />

              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <div className="text-sm font-medium">
                    Admin {admin.displayName}
                  </div>
                  {admin.isCurrentUser && (
                    <span className="bg-primary-base rounded-full px-2 py-0.5 text-xs text-white">
                      You
                    </span>
                  )}
                </div>
                <div className="text-muted-foreground truncate font-mono text-xs">
                  <Copyable
                    withKey={false}
                    value={admin.pubKeyHash}
                    keyLabel={''}
                  />
                  {}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Validation Message */}
      {selectedCount > 0 && selectedCount < minRequiredSigners && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
          <p className="flex items-center gap-2 text-sm text-yellow-800">
            <span>⚠️</span>
            <span>
              You need to select at least {minRequiredSigners} admin
              {minRequiredSigners !== 1 ? 's' : ''} to meet the minimum signing
              requirement.
            </span>
          </p>
        </div>
      )}
    </div>
  );

  const modalFooter = !loading && !error && (
    <div className="flex w-full gap-3">
      <Button
        variant="outline"
        onClick={onCancel}
        className="text-primary-base! flex-1"
      >
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleConfirm}
        disabled={!canConfirm}
        className="flex-1"
      >
        {decision === 'approve' ? 'Create Approval' : 'Create Rejection'}
        <span className="ml-1">({selectedCount})</span>
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isVisible}
      onClose={onCancel}
      title="Select Required Signers"
      description={`Choose which admins must sign to ${decision} this application`}
      size="2xl"
      footer={modalFooter}
    >
      {modalContent}
    </Modal>
  );
};

export default AdminSelectorModal;
