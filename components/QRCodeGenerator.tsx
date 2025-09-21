"use client";

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  url: string;
  size?: number;
  className?: string;
}

export default function QRCodeGenerator({ url, size = 200, className = "" }: QRCodeGeneratorProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        setLoading(true);
        setError('');
        
        const dataUrl = await QRCode.toDataURL(url, {
          width: size,
          margin: 2,
          color: {
            dark: '#1f2937', // gray-800
            light: '#ffffff', // white
          },
          errorCorrectionLevel: 'M',
        });
        
        setQrCodeDataUrl(dataUrl);
      } catch (err) {
        console.error('Error generating QR code:', err);
        setError('Failed to generate QR code');
      } finally {
        setLoading(false);
      }
    };

    if (url) {
      generateQRCode();
    }
  }, [url, size]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 rounded-lg ${className}`}>
        <div className="text-center w-48 h-48 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Generating QR code...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-red-50 rounded-lg border border-red-200 ${className}`}>
        <div className="text-center p-4 w-48 h-48 flex flex-col items-center justify-center">
          <svg className="w-8 h-8 text-red-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <img 
        src={qrCodeDataUrl} 
        alt={`QR code for ${url}`}
        className="rounded-lg shadow-sm border border-gray-200 w-48 h-48"
      />
      <p className="text-xs text-gray-500 mt-2 text-center max-w-48">
        Scan with your phone camera
      </p>
    </div>
  );
}
