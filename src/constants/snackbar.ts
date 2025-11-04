/**
 * Snackbar variant 상수
 */
export const SNACKBAR_VARIANT = {
  ERROR: 'error',
  SUCCESS: 'success',
  INFO: 'info',
  WARNING: 'warning',
} as const;

export type SnackbarVariant = (typeof SNACKBAR_VARIANT)[keyof typeof SNACKBAR_VARIANT];
