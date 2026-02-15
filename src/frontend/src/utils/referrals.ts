export function buildReferralLink(referralCode: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/?ref=${encodeURIComponent(referralCode)}`;
}

export function getReferralCodeFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('ref');
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
