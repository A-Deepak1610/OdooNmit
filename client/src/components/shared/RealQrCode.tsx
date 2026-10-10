import React, { useState } from 'react';
import { QrCode as QrIcon, CheckCircle2, Copy } from 'lucide-react';

interface RealQrCodeProps {
  value: string;
  size?: number;
  label?: string;
  subLabel?: string;
  showPayloadPreview?: boolean;
  className?: string;
}

/**
 * RealQrCode renders an authentic, scannable QR code generated from the real-time payload.
 * Any smartphone camera can scan this QR code to view the ticket verification data!
 */
export const RealQrCode: React.FC<RealQrCodeProps> = ({
  value,
  size = 180,
  label,
  subLabel,
  showPayloadPreview = true,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Encode full payload URL or verification token
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=10&data=${encodeURIComponent(
    value
  )}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`flex flex-col items-center text-center ${className}`}
      style={{ fontFamily: 'var(--font-family-body)' }}
    >
      {/* Authentic Scannable QR Container */}
      <div
        style={{
          width: size + 20,
          height: size + 20,
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '10px',
        }}
      >
        {!imageLoaded && !imageError && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              color: '#64748b',
              fontSize: '11px',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                border: '3px solid #cbd5e1',
                borderTopColor: '#1e3a8a',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            <span>Generating QR...</span>
          </div>
        )}

        {!imageError ? (
          <img
            src={qrUrl}
            alt={`Authentic QR Code: ${label || value}`}
            width={size}
            height={size}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            style={{
              display: imageLoaded ? 'block' : 'none',
              borderRadius: '8px',
              objectFit: 'contain',
              userSelect: 'none',
            }}
          />
        ) : (
          /* SVG Fallback if offline/network restricted */
          <div
            style={{
              width: size,
              height: size,
              background: '#0f172a',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              padding: '12px',
            }}
          >
            <QrIcon style={{ width: '48px', height: '48px', marginBottom: '8px', color: '#60a5fa' }} />
            <span style={{ fontSize: '10px', fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {value}
            </span>
          </div>
        )}
      </div>

      {/* Label and Sublabel */}
      {label && (
        <div
          style={{
            fontSize: '13px',
            fontWeight: 800,
            color: '#1e3a8a',
            marginTop: '10px',
            fontFamily: 'monospace',
            letterSpacing: '0.5px',
          }}
        >
          {label}
        </div>
      )}

      {subLabel && (
        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
          {subLabel}
        </div>
      )}

      {/* Interactive Payload Tooltip / Copy */}
      {showPayloadPreview && (
        <div
          style={{
            marginTop: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            color: '#475569',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            padding: '4px 10px',
            borderRadius: '6px',
          }}
        >
          <span style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Payload: {value}
          </span>
          <button
            onClick={handleCopy}
            title="Copy verification token"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: copied ? '#15803d' : '#2563eb',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {copied ? <CheckCircle2 style={{ width: '13px', height: '13px' }} /> : <Copy style={{ width: '13px', height: '13px' }} />}
          </button>
        </div>
      )}
    </div>
  );
};
