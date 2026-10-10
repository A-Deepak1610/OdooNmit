import React, { useState } from "react";
import {
  AlertTriangle,
  QrCode,
  UserPlus,
  CheckCircle2,
  Award,
  Search,
  Check,
  Copy,
  CreditCard,
  RefreshCw,
  Send,
} from "lucide-react";
import { mockMembers, MockMember } from "../../../data/mockClubData";

export const MembershipModule: React.FC = () => {
  const [members, setMembers] = useState<MockMember[]>(mockMembers);
  const [selectedMember, setSelectedMember] = useState<MockMember>(mockMembers[0]);
  const [search, setSearch] = useState("");
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [isSendingBatch, setIsSendingBatch] = useState(false);
  const [batchNotice, setBatchNotice] = useState<string | null>(null);

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
    const addedMember: MockMember = {
      id: `mem-${Date.now()}`,
      name: newStudent.name,
      email: newStudent.email,
      membershipId: newId,
      tier: "PREMIUM",
      duesPaid: true,
      duesExpiresAt: "May 31, 2027",
      renewalAlert: false,
      discountEligible: true,
    };

    setMembers([addedMember, ...members]);
    setSelectedMember(addedMember);
    setShowRegisterForm(false);
    setRegisteredNotice(
      `Welcome ${newStudent.name}! Digital pass created with ID ${newId}. Annual dues of ₹250 recorded as Paid.`
    );
    setNewStudent({
      name: "",
      email: "",
      rollNo: "",
      dept: "Computer Science",
    });
  };

  const handleToggleDues = (memberId: string) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === memberId) {
          const nextStatus = !m.duesPaid;
          const updated: MockMember = {
            ...m,
            duesPaid: nextStatus,
            duesExpiresAt: nextStatus ? "May 31, 2027" : "Overdue",
            discountEligible: nextStatus,
            renewalAlert: !nextStatus,
          };
          if (selectedMember.id === memberId) {
            setSelectedMember(updated);
          }
          return updated;
        }
        return m;
      })
    );
  };

  const handleSendBatchReminders = () => {
    setIsSendingBatch(true);
    setTimeout(() => {
      setIsSendingBatch(false);
      setBatchNotice(
        "Automated renewal notifications & SMS payment links dispatched to all 18 student members with pending or lapsing dues."
      );
    }, 600);
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(
      `VERIFIED-PASS:${selectedMember.membershipId}:${selectedMember.name}:DUE_PAID_2026`
    );
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
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
              Institutional Operations
            </span>
            <span style={{ fontSize: "12px", color: "#64748b" }}>
              Skyline Student Association • Active Term 2025-26
            </span>
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#1e293b", margin: "0 0 4px 0" }}>
            Membership Lifecycle & Dues Management
          </h2>
          <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
            Instant table sign-up, annual dues payment tracking (₹250/yr), renewal lapse alerts, and live digital verification passes.
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
          {showRegisterForm ? "Close Form" : "Table Sign-up (New Member)"}
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

      {batchNotice && (
        <div
          style={{
            padding: "14px 18px",
            borderRadius: "8px",
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "13px",
            color: "#1d4ed8",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircle2 size={16} color="#1d4ed8" />
            <span>{batchNotice}</span>
          </div>
          <button
            onClick={() => setBatchNotice(null)}
            style={{
              background: "none",
              border: "none",
              color: "#1d4ed8",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Renewal Expiry Warning Alert */}
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
          onClick={handleSendBatchReminders}
          disabled={isSendingBatch}
          style={{
            background: "#b45309",
            color: "white",
            border: "none",
            borderRadius: "6px",
            padding: "8px 14px",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            opacity: isSendingBatch ? 0.7 : 1,
          }}
        >
          {isSendingBatch ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
          {isSendingBatch ? "Dispatching..." : "Send Batch Reminders"}
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
                  placeholder="e.g. Thirumurugan K"
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
                  placeholder="e.g. thirumurugank.al24@bitsathy.ac.in"
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
                  <option value="Artificial Intelligence & DS">Artificial Intelligence & DS</option>
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

      {/* Main 2:1 Split: Member Directory (2fr) & Live Digital ID Card Showcase (1fr) */}
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
                Member Verification & Dues Ledger ({members.length} Members)
              </h3>
              <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
                Click any row or "View Pass" to instantly preview and verify their live Digital Pass.
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
                placeholder="Search member, email, or ID..."
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
                  <th style={{ padding: "10px 12px", fontWeight: 600, fontSize: "12px", textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((m, idx) => {
                  const avatarBg = ["ffd5dc", "b6e3f4", "c0aede"][idx % 3];
                  const isSelected = selectedMember.id === m.id;

                  return (
                    <tr
                      key={m.id}
                      onClick={() => setSelectedMember(m)}
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                        backgroundColor: isSelected ? "#eff6ff" : "transparent",
                        cursor: "pointer",
                        transition: "background-color 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = "#f8fafc";
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <td style={{ padding: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <img
                            src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(m.name)}&backgroundColor=${avatarBg}`}
                            alt={m.name}
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              flexShrink: 0,
                              border: isSelected ? "2px solid #2563eb" : "1px solid #e2e8f0",
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "13px" }}>
                              {m.name}
                              {m.email.includes("thirumurugan") && (
                                <span
                                  style={{
                                    marginLeft: "6px",
                                    fontSize: "10px",
                                    background: "#dbeafe",
                                    color: "#1e40af",
                                    padding: "1px 6px",
                                    borderRadius: "4px",
                                    fontWeight: 700,
                                  }}
                                >
                                  You (Admin)
                                </span>
                              )}
                            </div>
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
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleDues(m.id);
                            }}
                            title="Toggle Annual Dues Payment"
                            style={{
                              background: m.duesPaid ? "#f8fafc" : "#15803d",
                              color: m.duesPaid ? "#475569" : "white",
                              border: m.duesPaid ? "1px solid #cbd5e1" : "none",
                              borderRadius: "4px",
                              padding: "4px 8px",
                              fontSize: "11px",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            {m.duesPaid ? "Toggle" : "Collect ₹250"}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMember(m);
                            }}
                            style={{
                              background: isSelected ? "#2563eb" : "#f1f5f9",
                              color: isSelected ? "white" : "#1e3a8a",
                              border: "none",
                              borderRadius: "4px",
                              padding: "4px 8px",
                              fontWeight: 600,
                              fontSize: "11px",
                              cursor: "pointer",
                            }}
                          >
                            {isSelected ? "Active Pass" : "View Pass"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (1fr): Skyline Digital ID Card */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
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
                    background: selectedMember.duesPaid ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)",
                    color: selectedMember.duesPaid ? "#4ade80" : "#f87171",
                    border: selectedMember.duesPaid
                      ? "1px solid rgba(74,222,128,0.3)"
                      : "1px solid rgba(248,113,113,0.3)",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "10px",
                    fontWeight: 600,
                  }}
                >
                  {selectedMember.duesPaid ? "ACTIVE MEMBER" : "PENDING DUES"}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <img
                  src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(selectedMember.name)}&backgroundColor=b6e3f4`}
                  alt={selectedMember.name}
                  style={{ width: "48px", height: "48px", borderRadius: "50%", border: "2px solid #818cf8" }}
                />
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "white" }}>
                    {selectedMember.name}
                  </div>
                  <div style={{ fontSize: "12px", color: "#94a3b8", fontFamily: "monospace" }}>
                    {selectedMember.membershipId}
                  </div>
                  <div style={{ fontSize: "11px", color: "#818cf8" }}>
                    {selectedMember.email}
                  </div>
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
                  <span style={{ fontWeight: 600, color: "white" }}>{selectedMember.duesExpiresAt}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#94a3b8" }}>Annual Dues Status:</span>
                  <span
                    style={{
                      fontWeight: 600,
                      color: selectedMember.duesPaid ? "#4ade80" : "#f87171",
                    }}
                  >
                    {selectedMember.duesPaid ? "₹250 (Paid)" : "₹250 (Unpaid)"}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#94a3b8" }}>Member Discounts:</span>
                  <span style={{ fontWeight: 600, color: "#818cf8" }}>
                    {selectedMember.discountEligible ? "Gala 60% • Merch 20%" : "None (Pay Dues)"}
                  </span>
                </div>
              </div>

              {/* Dynamic QR Verification Box */}
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
                <p style={{ fontSize: "11px", color: "#64748b", margin: "8px 0 2px" }}>
                  Scan at event entrance or checkout desk for instant validation
                </p>
                <div style={{ fontSize: "10px", color: "#94a3b8", fontFamily: "monospace" }}>
                  TOKEN: {selectedMember.membershipId}-SECURE
                </div>
              </div>
            </div>

            {/* Quick Actions on Pass */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "16px" }}>
              <button
                onClick={handleCopyToken}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "white",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                {copiedToken ? <Check size={14} color="#4ade80" /> : <Copy size={14} />}
                {copiedToken ? "Token Copied to Clipboard!" : "Copy Verification Token"}
              </button>

              <button
                onClick={() => handleToggleDues(selectedMember.id)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  background: selectedMember.duesPaid ? "#dc2626" : "#16a34a",
                  border: "none",
                  color: "white",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <CreditCard size={14} />
                {selectedMember.duesPaid ? "Revoke / Mark Dues Unpaid" : "Record ₹250 Payment as Paid"}
              </button>
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
