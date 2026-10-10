import React from 'react';


export const AdminEventAnalyticsPage: React.FC = () => {
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
                color: '#7c3aed',
                background: '#f3e8ff',
                padding: '2px 8px',
                borderRadius: '4px',
                textTransform: 'uppercase',
              }}
            >
              Turnout & Ticket Metrics
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Campus Event Operations
            </span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>
            Event Analytics & Door Velocities
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            In-depth analysis of ticket tier uptake, door scan velocities, and member discount pass utilization.
          </p>
        </div>
      </div>

      {/* 3 Metric Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
        }}
      >
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Average Turnout Rate
          </span>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#1e293b', marginTop: '6px' }}>
            91.4%
          </div>
          <p style={{ fontSize: '12px', color: '#16a34a', margin: '6px 0 0 0', fontWeight: 600 }}>
            +4.2% vs previous term
          </p>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Member Discount Pass Adoption
          </span>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#1e293b', marginTop: '6px' }}>
            68.2%
          </div>
          <p style={{ fontSize: '12px', color: '#2563eb', margin: '6px 0 0 0', fontWeight: 600 }}>
            Students using 60% club discount
          </p>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
            Peak Check-in Velocity
          </span>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#1e293b', marginTop: '6px' }}>
            8.4 scans / min
          </div>
          <p style={{ fontSize: '12px', color: '#7c3aed', margin: '6px 0 0 0', fontWeight: 600 }}>
            Main auditorium entrance gate
          </p>
        </div>
      </div>

      {/* Ticket Tier Breakdown Table */}
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
            Spring Gala 2026 Ticket Tier Performance
          </h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b' }}>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>TIER NAME</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>MEMBER PRICE</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>PUBLIC PRICE</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>ALLOCATED</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>CLAIMED / SOLD</th>
                <th style={{ padding: '12px 20px', fontWeight: 600, textAlign: 'right' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px 20px', fontWeight: 600, color: '#1e293b' }}>Club Member Pass</td>
                <td style={{ padding: '14px 20px', color: '#16a34a', fontWeight: 600 }}>₹100</td>
                <td style={{ padding: '14px 20px', color: '#64748b' }}>₹250</td>
                <td style={{ padding: '14px 20px' }}>300</td>
                <td style={{ padding: '14px 20px', fontWeight: 600 }}>270 (90%)</td>
                <td style={{ padding: '14px 20px', textAlign: 'right', color: '#16a34a', fontWeight: 600 }}>Available (30 Left)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px 20px', fontWeight: 600, color: '#1e293b' }}>General Campus Admission</td>
                <td style={{ padding: '14px 20px', color: '#16a34a', fontWeight: 600 }}>₹150</td>
                <td style={{ padding: '14px 20px', color: '#64748b' }}>₹300</td>
                <td style={{ padding: '14px 20px' }}>150</td>
                <td style={{ padding: '14px 20px', fontWeight: 600 }}>100 (66%)</td>
                <td style={{ padding: '14px 20px', textAlign: 'right', color: '#16a34a', fontWeight: 600 }}>Available (50 Left)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px 20px', fontWeight: 600, color: '#1e293b' }}>VIP Banquet Table (Per Seat)</td>
                <td style={{ padding: '14px 20px', color: '#16a34a', fontWeight: 600 }}>₹400</td>
                <td style={{ padding: '14px 20px', color: '#64748b' }}>₹600</td>
                <td style={{ padding: '14px 20px' }}>50</td>
                <td style={{ padding: '14px 20px', fontWeight: 600 }}>50 (100%)</td>
                <td style={{ padding: '14px 20px', textAlign: 'right', color: '#dc2626', fontWeight: 700 }}>Sold Out</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
