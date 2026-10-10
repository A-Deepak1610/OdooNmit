import React, { useState } from "react";
import {
  AlertTriangle,
  QrCode,
  UserPlus,
  CheckCircle2,
  Award,
  Search,
} from "lucide-react";
import { mockMembers } from "../../../data/mockClubData";

export const MembershipModule: React.FC = () => {
  const [members, setMembers] = useState(mockMembers);
  const [search, setSearch] = useState("");
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    rollNo: "",
    dept: "Computer Science",
  });
  const [registeredNotice, setRegisteredNotice] = useState<string | null>(null);

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.membershipId.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()),
  );

  const handleRegisterNewMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.email) return;

    const newId = `SSA-2026-${String(members.length + 101).padStart(4, "0")}`;
    const addedMember = {
      id: `mem-${Date.now()}`,
      name: newStudent.name,
      email: newStudent.email,
      membershipId: newId,
      tier: "STANDARD" as const,
      duesPaid: true,
      duesExpiresAt: "May 31, 2027",
      renewalAlert: false,
      discountEligible: true,
    };

    setMembers([addedMember, ...members]);
    setShowRegisterForm(false);
    setRegisteredNotice(
      `Welcome ${newStudent.name}! Member profile created with ID ${newId}. Dues of ₹250 recorded as Paid.`,
    );
    setNewStudent({
      name: "",
      email: "",
      rollNo: "",
      dept: "Computer Science",
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* ── 1. MODULE HEADER ───────────────────────────────── */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          padding: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#15803d",
                background: "#dcfce7",
                padding: "2px 8px",
                borderRadius: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Dev 2 Workstream
            </span>
            <span style={{ fontSize: "12px", color: "#64748b" }}>
              Problem Scene: "A new student joins & dues tracking"
            </span>
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#1e293b", margin: "0 0 4px 0" }}>
            Membership Lifecycle & Dues Management
          </h2>
          <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
            Instant table sign-up, annual dues payment tracking (₹250/yr), renewal lapse alerts, and digital verification passes.
          </p>
        </div>

        <button
          onClick={() => setShowRegisterForm(!showRegisterForm)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 18px",
            background: "#1e3a8a",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          <UserPlus size={16} />
          Table Sign-up (New Member)
        </button>
      </div>

      {registeredNotice && (
        <div
          style={{
            padding: "14px 18px",
            borderRadius: "8px",
            background: "#dcfce7",
            border: "1px solid #bbf7d0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "13px",
            color: "#15803d",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircle2 size={16} color="#15803d" />
            <span>{registeredNotice}</span>
          </div>
          <button
            onClick={() => setRegisteredNotice(null)}
            style={{
              background: "none",
              border: "none",
              color: "#15803d",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Renewal Expiry Warning Alert (Problem Statement Scene) */}
      <div
        style={{
          background: "#fef3c7",
          border: "1px solid #fde68a",
          borderRadius: "8px",
          padding: "14px 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "14px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: "rgba(245, 158, 11, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={18} color="#b45309" />
          </div>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#b45309" }}>
              Upcoming Annual Dues Renewal Window (Spring 2026)
            </div>
            <div style={{ fontSize: "12px", color: "#92400e", marginTop: "2px" }}>
              18 student memberships are lapsing within 30 days. Automated reminders notify students before gala discount eligibility expires.
            </div>
          </div>
        </div>

        <button
          style={{
            background: "#b45309",
            color: "white",
            border: "none",
            borderRadius: "6px",
            padding: "8px 14px",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Send Batch Reminders
        </button>
      </div>

      {/* Inline Campus Table Sign-up Form */}
      {showRegisterForm && (
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            padding: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              borderBottom: "1px solid #e2e8f0",
              paddingBottom: "12px",
            }}
          >
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#1e293b", margin: "0 0 2px 0" }}>
                Campus Table Registration (Sign-up Desk)
              </h3>
              <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
                Register a newly joined student right at the orientation table and record their ₹250 annual dues.
              </p>
            </div>
            <button
              onClick={() => setShowRegisterForm(false)}
              style={{
                background: "none",
                border: "none",
                color: "#64748b",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 500,
              }}
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleRegisterNewMember}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "14px",
                marginBottom: "16px",
              }}
            >
              <div>
                <label style={formLabel}>Full Student Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={formLabel}>College Email</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rahul@bitsathy.ac.in"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={formLabel}>Department</label>
                <select
                  value={newStudent.dept}
                  onChange={(e) => setNewStudent({ ...newStudent, dept: e.target.value })}
                  style={selectStyle}
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Tech">Information Tech</option>
                  <option value="Electronics & Comm">Electronics & Comm</option>
                  <option value="Mechanical Eng">Mechanical Eng</option>
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end" }}>
                <button
                  type="submit"
                  style={{
                    width: "100%",
                    height: "38px",
                    background: "#1e3a8a",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Enroll & Mark ₹250 Paid
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Main 2:1 Split: Member Directory (2fr) & Digital ID Card Showcase (1fr) */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
        {/* Left Column (2fr): Member Directory & Verification Table */}
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            padding: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#1e293b", margin: "0 0 2px 0" }}>
                Member Verification & Dues Ledger (248 Members)
              </h3>
              <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
                Instant verification of dues status, expiry timeline, and discount eligibility.
              </p>
            </div>

            <div style={{ position: "relative", width: "240px" }}>
              <Search
                size={16}
                color="#94a3b8"
                style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                type="text"
                placeholder="Search member or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  height: "36px",
                  paddingLeft: "34px",
                  paddingRight: "10px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                  fontSize: "13px",
                  background: "#f8fafc",
                  outline: "none",
                }}
              />
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                  <th style={{ padding: "10px 12px", fontWeight: 600, fontSize: "12px" }}>MEMBER</th>
                  <th style={{ padding: "10px 12px", fontWeight: 600, fontSize: "12px" }}>ID</th>
                  <th style={{ padding: "10px 12px", fontWeight: 600, fontSize: "12px" }}>DUES STATUS</th>
                  <th style={{ padding: "10px 12px", fontWeight: 600, fontSize: "12px" }}>EXPIRY</th>
                  <th style={{ padding: "10px 12px", fontWeight: 600, fontSize: "12px" }}>BENEFIT</th>
                  <th style={{ padding: "10px 12px", fontWeight: 600, fontSize: "12px", textAlign: "right" }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((m, idx) => {
                  const avatarBg = ["ffd5dc", "b6e3f4", "c0aede"][idx % 3];
                  return (
                    <tr
                      key={m.id}
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <img
                            src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(m.name)}&backgroundColor=${avatarBg}`}
                            alt={m.name}
                            style={{ width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0 }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "13px" }}>{m.name}</div>
                            <div style={{ fontSize: "11px", color: "#64748b" }}>{m.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px", fontFamily: "monospace", fontWeight: 600, color: "#475569" }}>
                        {m.membershipId}
                      </td>
                      <td style={{ padding: "12px" }}>
                        {m.duesPaid ? (
                          <span
                            style={{
                              background: "#dcfce7",
                              color: "#15803d",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontWeight: 600,
                              fontSize: "11px",
                            }}
                          >
                            Paid (₹250)
                          </span>
                        ) : (
                          <span
                            style={{
                              background: "#fef2f2",
                              color: "#dc2626",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontWeight: 600,
                              fontSize: "11px",
                            }}
                          >
                            Unpaid
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "12px", color: "#64748b", fontSize: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span>{m.duesExpiresAt}</span>
                          {m.renewalAlert && (
                            <span
                              style={{
                                background: "#fef3c7",
                                color: "#b45309",
                                padding: "1px 6px",
                                borderRadius: "4px",
                                fontSize: "10px",
                                fontWeight: 600,
                              }}
                            >
                              Lapse Notice
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "12px" }}>
                        {m.discountEligible ? (
                          <span style={{ color: "#16a34a", fontWeight: 600, fontSize: "11px" }}>
                            60% Off Events
                          </span>
                        ) : (
                          <span style={{ color: "#94a3b8", fontSize: "11px" }}>Regular Rate</span>
                        )}
                      </td>
                      <td style={{ padding: "12px", textAlign: "right" }}>
                        <button
                          style={{
                            background: "none",
                            border: "none",
                            color: "#1e3a8a",
                            fontWeight: 600,
                            fontSize: "12px",
                            cursor: "pointer",
                          }}
                        >
                          View Pass
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (1fr): Skyline Digital ID Card */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
              borderRadius: "12px",
              border: "1px solid #334155",
              padding: "20px",
              color: "white",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                  paddingBottom: "12px",
                  marginBottom: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Award size={18} color="#818cf8" />
                  <span style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.5px", color: "#c7d2fe" }}>
                    SKYLINE DIGITAL PASS
                  </span>
                </div>
                <span
                  style={{
                    background: "rgba(34,197,94,0.2)",
                    color: "#4ade80",
                    border: "1px solid rgba(74,222,128,0.3)",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "10px",
                    fontWeight: 600,
                  }}
                >
                  ACTIVE MEMBER
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <img
                  src="https://api.dicebear.com/9.x/thumbs/svg?seed=Deepak&backgroundColor=b6e3f4"
                  alt="Deepak Kumar"
                  style={{ width: "44px", height: "44px", borderRadius: "50%", border: "2px solid #818cf8" }}
                />
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 700 }}>Deepak Kumar</div>
                  <div style={{ fontSize: "12px", color: "#94a3b8", fontFamily: "monospace" }}>SSA-2026-0042</div>
                  <div style={{ fontSize: "11px", color: "#818cf8" }}>Dept: Computer Science</div>
                </div>
              </div>

              <div
                style={{
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "8px",
                  padding: "12px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  fontSize: "12px",
                  marginBottom: "16px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#94a3b8" }}>Dues Valid Until:</span>
                  <span style={{ fontWeight: 600, color: "white" }}>May 31, 2026</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#94a3b8" }}>Annual Dues Status:</span>
                  <span style={{ fontWeight: 600, color: "#4ade80" }}>₹250 (Paid)</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#94a3b8" }}>Member Discounts:</span>
                  <span style={{ fontWeight: 600, color: "#818cf8" }}>Gala 60% • Merch 20%</span>
                </div>
              </div>

              <div
                style={{
                  background: "white",
                  borderRadius: "8px",
                  padding: "14px",
                  textAlign: "center",
                  color: "#0f172a",
                }}
              >
                <QrCode size={110} style={{ margin: "0 auto" }} />
                <p style={{ fontSize: "11px", color: "#64748b", margin: "8px 0 0" }}>
                  Scan at event entrance or checkout desk for instant validation
                </p>
              </div>
            </div>

            <div
              style={{
                textAlign: "center",
                fontSize: "11px",
                color: "#94a3b8",
                marginTop: "16px",
                borderTop: "1px solid rgba(255,255,255,0.08)",
                paddingTop: "12px",
              }}
            >
              Skyline Student Association • Academic Term 2025-26
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── MODULE-SCOPE STYLES ───────────────────────────────── */
const formLabel: React.CSSProperties = {
  display: "block",
  marginBottom: "6px",
  fontSize: "12px",
  fontWeight: 600,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.4px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: "38px",
  padding: "0 12px",
  border: "1px solid #e2e8f0",
  borderRadius: "6px",
  background: "#f8fafc",
  color: "#1e293b",
  fontSize: "13px",
  outline: "none",
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  height: "38px",
  padding: "0 12px",
  border: "1px solid #e2e8f0",
  borderRadius: "6px",
  background: "#f8fafc",
  color: "#1e293b",
  fontSize: "13px",
  outline: "none",
  cursor: "pointer",
};

