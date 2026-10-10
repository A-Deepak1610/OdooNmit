import React, { useState } from 'react';
import {
  Save,
  CheckCircle2,
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [collegeName, setCollegeName] = useState('Dr.SNS Rajalakshmi College Of Arts and Science');
  const [academicTerm, setAcademicTerm] = useState('Academic Year 2025-26');
  const [annualDues, setAnnualDues] = useState(250);
  const [gracePeriodDays, setGracePeriodDays] = useState(30);
  const [require2FA, setRequire2FA] = useState(true);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice('Institutional configurations updated successfully.');
    setTimeout(() => setSavedNotice(null), 3500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#2563eb',
                background: '#eff6ff',
                padding: '2px 8px',
                borderRadius: '4px',
                textTransform: 'uppercase',
              }}
            >
              System Configuration
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Campus Administration Parameters
            </span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>
            Organization & Campus Settings
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Configure institutional parameters, annual club dues policies, and administrative security preferences.
          </p>
        </div>
      </div>

      {savedNotice && (
        <div
          style={{
            background: '#dcfce7',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '12px 18px',
            color: '#15803d',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* Settings Form Card */}
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '28px',
        }}
      >
        <form onSubmit={handleSave}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '640px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>
                Collegiate Institution Name
              </label>
              <input
                type="text"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  background: '#f8fafc',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>
                  Active Academic Term
                </label>
                <input
                  type="text"
                  value={academicTerm}
                  onChange={(e) => setAcademicTerm(e.target.value)}
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '0 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    background: '#f8fafc',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>
                  Standard Annual Dues (₹)
                </label>
                <input
                  type="number"
                  value={annualDues}
                  onChange={(e) => setAnnualDues(Number(e.target.value))}
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '0 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    background: '#f8fafc',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>
                Dues Renewal Grace Period (Days)
              </label>
              <input
                type="number"
                value={gracePeriodDays}
                onChange={(e) => setGracePeriodDays(Number(e.target.value))}
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  background: '#f8fafc',
                }}
              />
              <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0 0 0' }}>
                Number of days prior to lapse where automated reminder notifications are triggered.
              </p>
            </div>

            <div style={{ paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={require2FA}
                  onChange={(e) => setRequire2FA(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#2563eb' }}
                />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                    Require Multi-Factor Authentication (2FA) for Admins
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    Enforce TOTP authenticator verification on privileged role logins.
                  </div>
                </div>
              </label>
            </div>

            <div style={{ paddingTop: '12px' }}>
              <button
                type="submit"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  background: '#1e3a8a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Save size={16} />
                Save Settings
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
