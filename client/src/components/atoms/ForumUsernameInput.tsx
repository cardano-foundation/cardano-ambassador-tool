'use client';

import { AmbassadorProfile } from '@/types/AmbassadorProfile';
import { cn } from '@/utils/utils';
import {
  CheckCircle,
  ExternalLink,
  Loader2,
  User,
  XCircle,
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

interface ForumUsernameInputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

interface VerificationState {
  isVerifying: boolean;
  isValid: boolean | null;
  error: string | null;
  userInfo: {
    name?: string;
    bio_excerpt?: string;
    created_at?: string;
  } | null;
}

const ForumUsernameInput: React.FC<ForumUsernameInputProps> = ({
  label = 'Cardano Forum Username',
  placeholder = 'Enter your forum.cardano.org username',
  value = '',
  onChange,
  className = '',
  disabled = false,
}) => {
  const [verificationState, setVerificationState] = useState<VerificationState>(
    {
      isVerifying: false,
      isValid: null,
      error: null,
      userInfo: null,
    },
  );

  // Debounced verification function
  const verifyUsername = useCallback(async (username: string) => {
    if (!username.trim()) {
      setVerificationState({
        isVerifying: false,
        isValid: null,
        error: null,
        userInfo: null,
      });
      return;
    }

    setVerificationState((prev) => ({
      ...prev,
      isVerifying: true,
      error: null,
    }));

    try {
      const res = await fetch(`/api/member/${username.trim()}`);

      if (!res.ok) {
        const errorText = await res.text();
        if (res.status === 403) {
          throw new Error('Forum API authentication failed');
        } else if (res.status === 404) {
          throw new Error('User not found on forum');
        } else {
          throw new Error('Failed to verify forum username');
        }
      }

      const profile: AmbassadorProfile = await res.json();

      setVerificationState({
        isVerifying: false,
        isValid: true,
        error: null,
        userInfo: {
          name: profile.name,
          bio_excerpt: profile.bio_excerpt,
          created_at: profile.created_at,
        },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Verification failed';

      if (
        errorMessage.includes('authentication failed') ||
        errorMessage.includes('403')
      ) {
        setVerificationState({
          isVerifying: false,
          isValid: null,
          error: null,
          userInfo: null,
        });
      } else {
        setVerificationState({
          isVerifying: false,
          isValid: false,
          error: errorMessage,
          userInfo: null,
        });
      }
    }
  }, []);

  // Debounce the verification
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      verifyUsername(value);
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [value, verifyUsername]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  const getStatusIcon = () => {
    if (verificationState.isVerifying) {
      return <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />;
    }

    if (verificationState.isValid === true) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }

    if (verificationState.isValid === false) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }

    return <User className="text-muted-foreground h-4 w-4" />;
  };

  const getStatusColor = () => {
    if (verificationState.isValid === true)
      return 'border-green-500 ring-green-500/20';
    if (verificationState.isValid === false)
      return 'border-red-500 ring-red-500/20';
    if (verificationState.isVerifying)
      return 'border-blue-500 ring-blue-500/20';
    return 'border-border';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className={className}>
      {label && (
        <label className="text-foreground mb-2 block text-sm font-medium">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'bg-background h-10 w-full rounded-md border px-3 py-2 pr-10 text-sm transition-colors',
            'focus:ring-primary-300/20 focus:ring-2 focus:outline-none',
            'disabled:cursor-not-allowed disabled:opacity-50',
            getStatusColor(),
          )}
        />

        <div className="absolute top-1/2 right-3 -translate-y-1/2 transform">
          {getStatusIcon()}
        </div>
      </div>

      {/* Status Messages */}
      <div className="mt-2 min-h-5">
        {verificationState.isVerifying && (
          <p className="text-muted-foreground text-sm">Verifying username...</p>
        )}

        {verificationState.isValid === true && verificationState.userInfo && (
          <div className="space-y-1">
            <p className="text-sm font-medium text-green-600">
              ✓ Verified forum account found
            </p>
            <div className="rounded-md border border-green-200 bg-green-50 p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-green-900">
                    {verificationState.userInfo.name || value}
                  </p>
                  {verificationState.userInfo.created_at && (
                    <p className="mt-1 text-xs text-green-600">
                      Member since{' '}
                      {formatDate(verificationState.userInfo.created_at)}
                    </p>
                  )}
                </div>
                <a
                  href={`https://forum.cardano.org/u/${value}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-green-600 transition-colors hover:text-green-800"
                  title="View forum profile"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        )}

        {verificationState.isValid === null &&
          value.trim() &&
          !verificationState.isVerifying && (
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">
                Forum verification temporarily unavailable
              </p>
              <p className="text-muted-foreground text-xs">
                Please ensure you have an active account on{' '}
                <a
                  href="https://forum.cardano.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:no-underline"
                >
                  forum.cardano.org
                </a>
              </p>
            </div>
          )}

        {verificationState.isValid === false && verificationState.error && (
          <div className="space-y-1">
            <p className="text-sm font-medium text-red-600">
              ✗ {verificationState.error}
            </p>
            <p className="text-muted-foreground text-xs">
              Make sure you have an active account on{' '}
              <a
                href="https://forum.cardano.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:no-underline"
              >
                forum.cardano.org
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumUsernameInput;
