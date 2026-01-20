/**
 * Form validation utilities for intent submission forms
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validates an email address format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates that a string is not empty after trimming
 */
export const isRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

/**
 * Validates that a string meets minimum length requirement
 */
export const hasMinLength = (value: string, minLength: number): boolean => {
  return value.trim().length >= minLength;
};

/**
 * Validates that a string doesn't exceed maximum length
 */
export const hasMaxLength = (value: string, maxLength: number): boolean => {
  return value.trim().length <= maxLength;
};

/**
 * Validates intent submission form data
 */
export interface IntentFormData {
  fullName: string;
  email: string;
  forum_username: string;
  country: string;
  city: string;
  bio: string;
  t_c: boolean;
}

export const validateIntentForm = (
  formData: IntentFormData,
): ValidationResult => {
  const errors: ValidationError[] = [];

  // Full Name validation
  if (!isRequired(formData.fullName)) {
    errors.push({
      field: 'fullName',
      message: 'Full name is required',
    });
  } else if (!hasMinLength(formData.fullName, 2)) {
    errors.push({
      field: 'fullName',
      message: 'Full name must be at least 2 characters long',
    });
  } else if (!hasMaxLength(formData.fullName, 100)) {
    errors.push({
      field: 'fullName',
      message: 'Full name must not exceed 100 characters',
    });
  }

  // Email validation
  if (!isRequired(formData.email)) {
    errors.push({
      field: 'email',
      message: 'Email address is required',
    });
  } else if (!isValidEmail(formData.email)) {
    errors.push({
      field: 'email',
      message: 'Please enter a valid email address',
    });
  } else if (!hasMaxLength(formData.email, 255)) {
    errors.push({
      field: 'email',
      message: 'Email address must not exceed 255 characters',
    });
  }

  // Forum Username validation
  if (!isRequired(formData.forum_username)) {
    errors.push({
      field: 'forum_username',
      message: 'Forum username is required',
    });
  } else if (!hasMinLength(formData.forum_username, 3)) {
    errors.push({
      field: 'forum_username',
      message: 'Forum username must be at least 3 characters long',
    });
  } else if (!hasMaxLength(formData.forum_username, 50)) {
    errors.push({
      field: 'forum_username',
      message: 'Forum username must not exceed 50 characters',
    });
  }

  // Country validation
  if (!isRequired(formData.country)) {
    errors.push({
      field: 'country',
      message: 'Country selection is required',
    });
  }

  // City validation
  if (!isRequired(formData.city)) {
    errors.push({
      field: 'city',
      message: 'City selection is required',
    });
  }

  // Bio validation
  if (!isRequired(formData.bio)) {
    errors.push({
      field: 'bio',
      message: 'Bio is required',
    });
  } else if (!hasMinLength(formData.bio, 10)) {
    errors.push({
      field: 'bio',
      message: 'Bio must be at least 10 characters long',
    });
  } else if (!hasMaxLength(formData.bio, 500)) {
    errors.push({
      field: 'bio',
      message: 'Bio must not exceed 500 characters',
    });
  }

  // Terms & Conditions validation
  if (!formData.t_c) {
    errors.push({
      field: 't_c',
      message: 'You must accept the Terms & Conditions to continue',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Profile edit form data interface
 */
export interface ProfileFormData {
  name: string;
  username: string;
  email: string;
  bio?: string;
  country?: string;
  city?: string;
  github?: string;
  twitter?: string;
  discord?: string;
  spoId?: string;
}

/**
 * Validates profile edit form data
 */
export const validateProfileForm = (
  formData: ProfileFormData,
): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!isRequired(formData.name)) {
    errors.push({
      field: 'name',
      message: 'Full name is required',
    });
  } else if (!hasMinLength(formData.name, 2)) {
    errors.push({
      field: 'name',
      message: 'Full name must be at least 2 characters long',
    });
  } else if (!hasMaxLength(formData.name, 100)) {
    errors.push({
      field: 'name',
      message: 'Full name must not exceed 100 characters',
    });
  }

  // Forum Username validation (username field)
  if (!isRequired(formData.username)) {
    errors.push({
      field: 'username',
      message: 'Forum username is required',
    });
  } else if (!hasMinLength(formData.username, 3)) {
    errors.push({
      field: 'username',
      message: 'Forum username must be at least 3 characters long',
    });
  } else if (!hasMaxLength(formData.username, 50)) {
    errors.push({
      field: 'username',
      message: 'Forum username must not exceed 50 characters',
    });
  }

  if (!isRequired(formData.email)) {
    errors.push({
      field: 'email',
      message: 'Email address is required',
    });
  } else if (!isValidEmail(formData.email)) {
    errors.push({
      field: 'email',
      message: 'Please enter a valid email address',
    });
  } else if (!hasMaxLength(formData.email, 255)) {
    errors.push({
      field: 'email',
      message: 'Email address must not exceed 255 characters',
    });
  }

  if (formData.bio && formData.bio.trim().length > 0) {
    if (!hasMinLength(formData.bio, 10)) {
      errors.push({
        field: 'bio',
        message: 'Bio must be at least 10 characters long',
      });
    } else if (!hasMaxLength(formData.bio, 500)) {
      errors.push({
        field: 'bio',
        message: 'Bio must not exceed 500 characters',
      });
    }
  }

  if (formData.country && !isRequired(formData.country)) {
    errors.push({
      field: 'country',
      message: 'Please select a valid country',
    });
  }

  if (formData.country && formData.country.trim().length > 0) {
    if (!formData.city || !isRequired(formData.city)) {
      errors.push({
        field: 'city',
        message: 'City is required when country is selected',
      });
    }
  }

  if (formData.github && formData.github.trim().length > 0) {
    if (!hasMaxLength(formData.github, 50)) {
      errors.push({
        field: 'github',
        message: 'GitHub username must not exceed 50 characters',
      });
    }
  }

  if (formData.twitter && formData.twitter.trim().length > 0) {
    if (!hasMaxLength(formData.twitter, 50)) {
      errors.push({
        field: 'twitter',
        message: 'Twitter handle must not exceed 50 characters',
      });
    }
  }

  if (formData.discord && formData.discord.trim().length > 0) {
    if (!hasMaxLength(formData.discord, 50)) {
      errors.push({
        field: 'discord',
        message: 'Discord username must not exceed 50 characters',
      });
    }
  }

  if (formData.spoId && formData.spoId.trim().length > 0) {
    if (!hasMaxLength(formData.spoId, 100)) {
      errors.push({
        field: 'spoId',
        message: 'SPO ID must not exceed 100 characters',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Get error message for a specific field
 */
export const getFieldError = (
  errors: ValidationError[],
  fieldName: string,
): string | undefined => {
  const error = errors.find((e) => e.field === fieldName);
  return error?.message;
};
