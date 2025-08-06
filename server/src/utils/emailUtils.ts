// Helper function to normalize Gmail addresses
export function normalizeGmailAddress(email: string): string {
  if (!email) return email;
  
  const [localPart, domain] = email.toLowerCase().split('@');
  
  // Only normalize Gmail addresses
  if (domain === 'gmail.com') {
    // Remove dots from local part and ignore everything after +
    const normalizedLocal = localPart.replace(/\./g, '').split('+')[0];
    return `${normalizedLocal}@${domain}`;
  }
  
  // For non-Gmail addresses, just lowercase
  return email.toLowerCase();
}