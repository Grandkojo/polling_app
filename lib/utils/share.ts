import QRCode from 'qrcode';

/**
 * Generate a share URL for a given share code
 */
export function generateShareUrl(shareCode: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/share/${shareCode}`;
}

/**
 * Generate QR code data URL for a given URL
 */
export async function generateQRCode(shareUrl: string): Promise<string> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(shareUrl, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
      } catch (err) {
        document.body.removeChild(textArea);
        return false;
      }
    }
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
}

/**
 * Validate if a URL is a valid share URL format
 */
export function isValidShareUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const baseUrlObj = new URL(baseUrl);
    
    return urlObj.origin === baseUrlObj.origin && 
           urlObj.pathname.startsWith('/share/') &&
           urlObj.pathname.split('/').length === 3;
  } catch {
    return false;
  }
}

/**
 * Extract share code from a share URL
 */
export function extractShareCodeFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    
    if (pathParts.length === 3 && pathParts[1] === 'share') {
      return pathParts[2];
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Format share statistics for display
 */
export function formatShareStats(shareCount: number, lastShared: string | null): string {
  if (shareCount === 0) {
    return 'Not shared yet';
  }
  
  if (shareCount === 1) {
    return 'Shared 1 time';
  }
  
  return `Shared ${shareCount} times`;
}

/**
 * Check if a share code is expired
 */
export function isShareCodeExpired(expiresAt: string | null): boolean {
  if (!expiresAt) {
    return false;
  }
  
  return new Date(expiresAt) < new Date();
}

/**
 * Format expiration date for display
 */
export function formatExpirationDate(expiresAt: string | null): string {
  if (!expiresAt) {
    return 'Never expires';
  }
  
  const date = new Date(expiresAt);
  const now = new Date();
  
  if (date < now) {
    return 'Expired';
  }
  
  const diffInHours = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 24) {
    return `Expires in ${diffInHours} hour${diffInHours !== 1 ? 's' : ''}`;
  }
  
  const diffInDays = Math.ceil(diffInHours / 24);
  return `Expires in ${diffInDays} day${diffInDays !== 1 ? 's' : ''}`;
}
