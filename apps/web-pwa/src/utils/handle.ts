const HANDLE_REGEX = /^[A-Za-z0-9_]{3,20}$/;

export function isValidHandle(value: string): boolean {
  return HANDLE_REGEX.test(value.trim());
}

export function getHandleError(value: string): string | null {
  if (!value.trim()) return 'Handle is required';
  if (value.trim().length < 3) return 'Handle must be at least 3 characters';
  if (value.trim().length > 20) return 'Handle must be at most 20 characters';
  if (!HANDLE_REGEX.test(value.trim())) return 'Handle can only contain letters, numbers, or underscores';
  return null;
}
