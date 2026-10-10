import React, { useState, useEffect } from "react";
import {
  Calendar,
  Ticket,
  Users,
  CheckCircle2,
  Clock,
  Search,
  AlertTriangle,
  CreditCard,
  Loader2,
  Sparkles,
} from "lucide-react";

import { useClubStore } from "../../../stores/club.store";
import { useAuthStore } from "../../../stores/auth.store";
import { RazorpayPaymentModal } from "../../shared/RazorpayPaymentModal";
import { RealQrCode } from "../../shared/RealQrCode";
import { useDebounce } from "../../../hooks/useDebounce";
import { MockEvent } from "../../../data/mockClubData";

export const EventsTicketingModule: React.FC = () => {
  const { user } = useAuthStore();

  const {
    events,
    doorTickets,
    bookEventTicket,
    checkInDoorTicket,
    searchEventsFromServer,
  } = useClubStore();

  // Debounced Server-Backed Event Search State
  const [eventSearchQuery, setEventSearchQuery] = useState("");
  const debouncedSearch = useDebounce(eventSearchQuery, 300);
  const [serverEvents, setServerEvents] = useState<MockEvent[]>(events);
  const [selectedEventId, setSelectedEventId] = useState<string>(
    events[0]?.id || "evt-gala-2026",
  );
  const [isSearching, setIsSearching] = useState(false);

  // Door QR Check-in Table Search State (Tab 2)
  const [doorSearchQuery, setDoorSearchQuery] = useState("");

  const [activeTab, setActiveTab] = useState<
    "overview" | "checkin" | "analytics"
  >("overview");
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [checkInAlert, setCheckInAlert] = useState<{
    message: string;
    isError?: boolean;
  } | null>(null);

  // Razorpay Checkout State
  const [selectedTier, setSelectedTier] = useState<{
    eventId: string;
    tierName: string;
    price: number;
    isMember: boolean;
  } | null>(null);

  // Query Backend Server whenever debounced search query changes
  useEffect(() => {
    const timer=setTimeout(() => {
      fetchEvents();
    }, 300);
    return () => {
      clearTimeout(timer);
    };
  }, [debouncedSearch, searchEventsFromServer]);

  // Dynamically resolve active event from server-fetched results
  const activeEvent: MockEvent =
    serverEvents.find((e) => e.id === selectedEventId) ||
    serverEvents[0] ||
    events[0];
  const springGala = activeEvent; // Alias for backward compatibility with child JSX components

  const fetchEvents = async () => {
    console.log("Fetching");
    setIsSearching(true);
    try {
      const results = await searchEventsFromServer(debouncedSearch);

      setServerEvents(results);
      if (
        results.length > 0 &&
        !results.some((e) => e.id === selectedEventId)
      ) {
        setSelectedEventId(results[0].id);
      }
    } catch (err) {
      console.error("Failed to search events from backend:", err);
    }
  };
  const handleOpenCheckout = (
    eventId: string,
    tierName: string,
    price: number,
    isMember: boolean,
  ) => {
    setSelectedTier({
      eventId,
      tierName,
      price,
      isMember,
    });
  };

  const handlePerformCheckIn = (ticketId: string) => {
    const result = checkInDoorTicket(ticketId);
    if (result.success) {
      setCheckInAlert({ message: result.message, isError: false });
    } else {
      setCheckInAlert({ message: result.message, isError: true });
    }
  };

  const filteredTickets = doorTickets.filter(
    (t) =>
      t.attendee.toLowerCase().includes(doorSearchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(doorSearchQuery.toLowerCase()),
  );

  const totalCheckedIn = doorTickets.filter((t) => t.checkedIn).length;
  const attendanceRate = Math.round(
    (totalCheckedIn / doorTickets.length) * 100,
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        fontFamily: "var(--font-family-body)",
      }}
    >
      {/* ── 1. MODULE TITLE HEADER CARD ─────────────────────────────────── */}
      <div
        style={{
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "4px",
            }}
          >
            <span
              style={{
                color: "#1e3a8a",
                background: "#eff6ff",
                padding: "2px 8px",
                borderRadius: "4px",
                fontWeight: 700,
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              FLAGSHIP EVENTS & TICKETING
            </span>
            <span style={{ fontSize: "12px", color: "#64748b" }}>
              Problem Scene: "Selling tickets for the spring gala & door
              check-in"
            </span>
          </div>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 800,
              color: "#1e293b",
              margin: "2px 0 2px 0",
            }}
          >
            Events, Dynamic Tier Pricing & QR Check-in
          </h2>
          <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
            Tier pricing with 60% member discounts, live seat capacity quotas,
            and instant door QR pass scanning without paper lists.
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: "flex",
            gap: "6px",
            background: "var(--muted)",
            padding: "4px",
            borderRadius: "8px",
          }}
        >
          {(["overview", "checkin", "analytics"] as const).map((tab) => {
            const isActive = activeTab === tab;
            const labels = {
              overview: "Gala Ticketing",
              checkin: "Door QR Scanner",
              analytics: "Turnout & Revenue",
            };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "6px",
                  border: "none",
                  background: isActive ? "var(--primary)" : "transparent",
                  color: isActive ? "white" : "var(--muted-foreground)",
                  fontSize: "13px",
                  fontWeight: isActive ? 700 : 500,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. DEBOUNCED SERVER EVENT SEARCH & CATALOG SELECTOR ───────────── */}
      <div
        style={{
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <Search
              style={{ width: "18px", height: "18px", color: "#1e3a8a" }}
            />
            <span
              style={{ fontSize: "14px", fontWeight: 800, color: "#1e293b" }}
            >
              Search Campus Events
            </span>
            <span
              style={{
                fontSize: "11px",
                padding: "2px 8px",
                borderRadius: "999px",
                fontWeight: 700,
                background: isSearching ? "#fef3c7" : "#ecfdf5",
                color: isSearching ? "#92400e" : "#065f46",
                border: isSearching ? "1px solid #fde68a" : "1px solid #a7f3d0",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              {isSearching ? (
                <>
                  <Loader2
                    style={{
                      width: "11px",
                      height: "11px",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  <span>Debouncing & Querying Server JSON...</span>
                </>
              ) : (
                <>
                  <CheckCircle2
                    style={{ width: "11px", height: "11px", color: "#10b981" }}
                  />
                  <span>
                    {debouncedSearch
                      ? `${serverEvents.length} result(s) from GET /api/v1/events?search=${debouncedSearch}`
                      : `Live Server Data (${serverEvents.length} events loaded)`}
                  </span>
                </>
              )}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              color: "#64748b",
            }}
          >
            <Sparkles
              style={{ width: "13px", height: "13px", color: "#d97706" }}
            />
            <span>Debounced (300ms) • Server-side JSON search</span>
          </div>
        </div>

        {/* Search Input */}
        <div style={{ position: "relative" }}>
          <Search
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "16px",
              height: "16px",
              color: "#94a3b8",
            }}
          />
          <input
            type="text"
            placeholder="Type to search events (e.g. 'Gala', 'Hackathon', 'Bake Sale', 'Auditorium', 'Cultural')..."
            value={eventSearchQuery}
            onChange={(e) => setEventSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 36px 10px 38px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "13px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          {eventSearchQuery && (
            <button
              onClick={() => setEventSearchQuery("")}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "#94a3b8",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 700,
              }}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Dynamic Event Selection Pills */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            overflowX: "auto",
            paddingBottom: "4px",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#64748b",
              whiteSpace: "nowrap",
            }}
          >
            Select Event:
          </span>
          {serverEvents.length === 0 ? (
            <span
              style={{
                fontSize: "12px",
                color: "#dc2626",
                fontStyle: "italic",
              }}
            >
              No events matched "{debouncedSearch}". Try a different keyword or
              clear search.
            </span>
          ) : (
            serverEvents.map((evt) => {
              const isSelected = evt.id === activeEvent.id;
              return (
                <button
                  key={evt.id}
                  onClick={() => setSelectedEventId(evt.id)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    border: isSelected
                      ? "1.5px solid #1e3a8a"
                      : "1px solid #e2e8f0",
                    background: isSelected ? "#eff6ff" : "#ffffff",
                    color: isSelected ? "#1e3a8a" : "#334155",
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: "12px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span>{evt.title}</span>
                  <span
                    style={{
                      fontSize: "10px",
                      padding: "1px 5px",
                      borderRadius: "4px",
                      background: isSelected ? "#dbeafe" : "#f1f5f9",
                      color: isSelected ? "#1e3a8a" : "#64748b",
                      fontWeight: 600,
                    }}
                  >
                    ₹{(evt.revenue || 0).toLocaleString()}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {bookingSuccess && (
        <div
          style={{
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
            color: "#065f46",
            padding: "12px 16px",
            borderRadius: "8px",
            fontSize: "13px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircle2
              style={{ width: "16px", height: "16px", color: "#10b981" }}
            />
            <span>{bookingSuccess}</span>
          </div>
          <button
            onClick={() => setBookingSuccess(null)}
            style={{
              background: "none",
              border: "none",
              color: "#065f46",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── TAB 1: GALA OVERVIEW & TIERS ─────────────────────────────── */}
      {activeTab === "overview" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "20px",
          }}
        >
          {/* Main Gala Card */}
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <span
                  style={{
                    color: "#b45309",
                    background: "#fef3c7",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontWeight: 700,
                    fontSize: "11px",
                  }}
                >
                  FLAGSHIP ANNUAL EVENT
                </span>
                <h3
                  style={{
                    fontSize: "22px",
                    fontWeight: 800,
                    color: "#1e293b",
                    margin: "8px 0 4px 0",
                  }}
                >
                  {springGala.title}
                </h3>
                <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                  Main campus gala with music, keynote address, catered dinner,
                  and annual awards banquet.
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <span
                  style={{
                    fontSize: "11px",
                    color: "#94a3b8",
                    display: "block",
                  }}
                >
                  Total Ticket Revenue
                </span>
                <span
                  style={{
                    fontSize: "20px",
                    fontWeight: 800,
                    color: "#15803d",
                  }}
                >
                  ₹{(springGala.revenue || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Event Meta Badges */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "10px",
                background: "var(--muted)",
                padding: "12px",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#1e293b",
                }}
              >
                <Calendar
                  style={{ width: "16px", height: "16px", color: "#1e3a8a" }}
                />
                <span>{springGala.date}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#1e293b",
                }}
              >
                <Clock
                  style={{ width: "16px", height: "16px", color: "#1e3a8a" }}
                />
                <span>{springGala.time}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#1e293b",
                }}
              >
                <Users
                  style={{ width: "16px", height: "16px", color: "#1e3a8a" }}
                />
                <span>{springGala.location}</span>
              </div>
            </div>

            {/* Capacity Progress Bar */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "6px" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12px",
                }}
              >
                <span style={{ color: "#64748b" }}>Seat Capacity Quota</span>
                <span style={{ color: "#1e3a8a", fontWeight: 700 }}>
                  {springGala.soldCount} / {springGala.capacity} Seats Claimed (
                  {Math.round(
                    (springGala.soldCount / springGala.capacity) * 100,
                  )}
                  %)
                </span>
              </div>
              <div
                style={{
                  height: "6px",
                  background: "var(--secondary)",
                  borderRadius: "3px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${(springGala.soldCount / springGala.capacity) * 100}%`,
                    background: "var(--primary)",
                    borderRadius: "3px",
                  }}
                />
              </div>
              <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                {springGala.capacity - springGala.soldCount} tickets remaining
                before registration closes.
              </span>
            </div>

            {/* Differential Tiers List */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <h4
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#1e293b",
                  textTransform: "uppercase",
                  letterSpacing: "0.4px",
                  margin: 0,
                }}
              >
                Differential Ticket Tiers (Member Discount Engine)
              </h4>
              {springGala.tiers.map((tier, idx) => {
                const isSoldOut = tier.available <= 0;
                return (
                  <div
                    key={idx}
                    style={{
                      padding: "14px 16px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: isSoldOut ? "#f8fafc" : "#ffffff",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "#1e293b",
                          }}
                        >
                          {tier.name}
                        </span>
                        {isSoldOut ? (
                          <span
                            style={{
                              fontSize: "11px",
                              color: "#dc2626",
                              background: "#fee2e2",
                              padding: "1px 6px",
                              borderRadius: "4px",
                              fontWeight: 700,
                            }}
                          >
                            Sold Out
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: "11px",
                              color: "#15803d",
                              background: "#dcfce7",
                              padding: "1px 6px",
                              borderRadius: "4px",
                              fontWeight: 700,
                            }}
                          >
                            {tier.available} left of {tier.total}
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>
                        Includes grand buffet banquet, door pass & voting
                        privileges
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                      }}
                    >
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontSize: "15px",
                            fontWeight: 800,
                            color: "#15803d",
                          }}
                        >
                          Member: ₹{tier.memberPrice}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#94a3b8",
                            textDecoration: "line-through",
                          }}
                        >
                          Non-Member: ₹{tier.nonMemberPrice}
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          handleOpenCheckout(
                            springGala.id,
                            tier.name,
                            tier.memberPrice,
                            true,
                          )
                        }
                        disabled={isSoldOut}
                        style={{
                          background: isSoldOut ? "#cbd5e1" : "#1e3a8a",
                          color: "white",
                          border: "none",
                          padding: "8px 16px",
                          borderRadius: "6px",
                          fontSize: "13px",
                          fontWeight: 700,
                          cursor: isSoldOut ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <CreditCard style={{ width: "14px", height: "14px" }} />
                        <span>Book Pass • Pay</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Side Card: Digital Ticket Preview */}
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid #e2e8f0",
                  paddingBottom: "12px",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#1e3a8a",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Ticket style={{ width: "16px", height: "16px" }} />
                  Digital QR Ticket
                </span>
                <span
                  style={{
                    color: "#15803d",
                    background: "#dcfce7",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  Authentic Pass
                </span>
              </div>

              <div>
                <span
                  style={{
                    fontSize: "11px",
                    color: "#64748b",
                    textTransform: "uppercase",
                  }}
                >
                  Attendee
                </span>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#1e293b",
                  }}
                >
                  {user?.name || "Deepak Kumar"}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#15803d",
                    fontWeight: 600,
                  }}
                >
                  Club Member Pass (₹100 Rate Applied)
                </div>
              </div>

              {/* QR Box */}
              <div
                style={{
                  padding: "16px",
                  background: "var(--muted)",
                  borderRadius: "10px",
                  border: "1px solid var(--border)",
                  textAlign: "center",
                }}
              >
                <RealQrCode
                  value="SSA-GALA-2026-9812-DEEPAK"
                  size={120}
                  label="SSA-GALA-2026-9812"
                  subLabel="Scan with camera for instant entrance verification"
                />
              </div>

              <div
                style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.5 }}
              >
                • Non-transferable digital QR pass
                <br />
                • Valid for 1 attendee admittance
                <br />• Duplicate scanning triggers security lockout
              </div>
            </div>

            <div
              style={{
                textAlign: "center",
                fontSize: "11px",
                color: "#94a3b8",
                paddingTop: "10px",
              }}
            >
              Skyline Student Association • Academic Term 2025-26
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: DOOR CHECK-IN SCANNER ────────────────────────────── */}
      {activeTab === "checkin" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#1e293b",
                    margin: 0,
                  }}
                >
                  Instant Door Check-in & Duplicate Entry Sentinel
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#64748b",
                    margin: "2px 0 0 0",
                  }}
                >
                  Door marshals can search attendee name or scan pass ID in
                  under 2 seconds.
                </p>
              </div>

              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#15803d",
                  }}
                >
                  {totalCheckedIn} / {doorTickets.length} Admitted (
                  {attendanceRate}%)
                </span>
              </div>
            </div>

            {/* Search Input */}
            <div style={{ position: "relative" }}>
              <Search
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "16px",
                  height: "16px",
                  color: "#94a3b8",
                }}
              />
              <input
                type="text"
                placeholder="Search ticket ID (e.g. TKT-GALA-001) or attendee name..."
                value={doorSearchQuery}
                onChange={(e) => setDoorSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 36px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
            </div>

            {checkInAlert && (
              <div
                style={{
                  background: checkInAlert.isError ? "#fef2f2" : "#f0fdf4",
                  border: checkInAlert.isError
                    ? "1px solid #fecaca"
                    : "1px solid #bbf7d0",
                  color: checkInAlert.isError ? "#b91c1c" : "#15803d",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {checkInAlert.isError ? (
                  <AlertTriangle
                    style={{ width: "18px", height: "18px", flexShrink: 0 }}
                  />
                ) : (
                  <CheckCircle2
                    style={{ width: "18px", height: "18px", flexShrink: 0 }}
                  />
                )}
                <span>{checkInAlert.message}</span>
              </div>
            )}

            {/* Attendee Roster Table */}
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "13px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#f8fafc",
                      borderBottom: "1px solid #e2e8f0",
                      textAlign: "left",
                    }}
                  >
                    <th
                      style={{
                        padding: "10px 12px",
                        fontWeight: 600,
                        color: "#475569",
                      }}
                    >
                      Ticket ID
                    </th>
                    <th
                      style={{
                        padding: "10px 12px",
                        fontWeight: 600,
                        color: "#475569",
                      }}
                    >
                      Attendee Name
                    </th>
                    <th
                      style={{
                        padding: "10px 12px",
                        fontWeight: 600,
                        color: "#475569",
                      }}
                    >
                      Tier
                    </th>
                    <th
                      style={{
                        padding: "10px 12px",
                        fontWeight: 600,
                        color: "#475569",
                      }}
                    >
                      Status
                    </th>
                    <th
                      style={{
                        padding: "10px 12px",
                        fontWeight: 600,
                        color: "#475569",
                      }}
                    >
                      Admitted At
                    </th>
                    <th
                      style={{
                        padding: "10px 12px",
                        fontWeight: 600,
                        color: "#475569",
                        textAlign: "right",
                      }}
                    >
                      Door Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((t) => (
                    <tr
                      key={t.id}
                      style={{ borderBottom: "1px solid #f1f5f9" }}
                    >
                      <td
                        style={{
                          padding: "12px",
                          fontFamily: "monospace",
                          fontWeight: 700,
                          color: "#1e3a8a",
                        }}
                      >
                        {t.id}
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          fontWeight: 600,
                          color: "#1e293b",
                        }}
                      >
                        {t.attendee}
                      </td>
                      <td style={{ padding: "12px", color: "#64748b" }}>
                        {t.tier}
                      </td>
                      <td style={{ padding: "12px" }}>
                        {t.checkedIn ? (
                          <span
                            style={{
                              background: "#dcfce7",
                              color: "#15803d",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "11px",
                              fontWeight: 700,
                            }}
                          >
                            ✓ Checked In
                          </span>
                        ) : (
                          <span
                            style={{
                              background: "#fef3c7",
                              color: "#b45309",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "11px",
                              fontWeight: 700,
                            }}
                          >
                            Unchecked
                          </span>
                        )}
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          color: "#64748b",
                          fontSize: "12px",
                        }}
                      >
                        {t.time}
                      </td>
                      <td style={{ padding: "12px", textAlign: "right" }}>
                        <button
                          onClick={() => handlePerformCheckIn(t.id)}
                          style={{
                            padding: "6px 12px",
                            background: t.checkedIn ? "#f1f5f9" : "#1e3a8a",
                            color: t.checkedIn ? "#64748b" : "white",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          {t.checkedIn ? "Rescan / Verify" : "Scan & Admit"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: TURNOUT ANALYTICS ─────────────────────────────────── */}
      {activeTab === "analytics" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              padding: "20px",
            }}
          >
            <span
              style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}
            >
              Total Gross Revenue
            </span>
            <div
              style={{
                fontSize: "24px",
                fontWeight: 800,
                color: "#15803d",
                marginTop: "4px",
              }}
            >
              ₹{springGala.revenue.toLocaleString()}
            </div>
            <div
              style={{ fontSize: "11px", color: "#10b981", marginTop: "6px" }}
            >
              ✓ Automatically reflected in Treasurer Ledger
            </div>
          </div>

          <div
            style={{
              background: "white",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              padding: "20px",
            }}
          >
            <span
              style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}
            >
              Admitted Turnout
            </span>
            <div
              style={{
                fontSize: "24px",
                fontWeight: 800,
                color: "#1e3a8a",
                marginTop: "4px",
              }}
            >
              {totalCheckedIn} Attendees
            </div>
            <div
              style={{ fontSize: "11px", color: "#64748b", marginTop: "6px" }}
            >
              {attendanceRate}% of registered guest list
            </div>
          </div>

          <div
            style={{
              background: "white",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              padding: "20px",
            }}
          >
            <span
              style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}
            >
              Seat Utilization
            </span>
            <div
              style={{
                fontSize: "24px",
                fontWeight: 800,
                color: "#7c3aed",
                marginTop: "4px",
              }}
            >
              {Math.round((springGala.soldCount / springGala.capacity) * 100)}%
            </div>
            <div
              style={{ fontSize: "11px", color: "#64748b", marginTop: "6px" }}
            >
              {springGala.capacity - springGala.soldCount} seats unallocated
            </div>
          </div>
        </div>
      )}

      {/* Razorpay Checkout Modal */}
      {selectedTier && (
        <RazorpayPaymentModal
          isOpen={Boolean(selectedTier)}
          onClose={() => setSelectedTier(null)}
          title={`Spring Gala Ticket: ${selectedTier.tierName}`}
          purpose={`Spring Gala Admission Pass (${selectedTier.tierName})`}
          amount={selectedTier.price}
          payerName={user?.name || "Deepak Kumar"}
          payerEmail={user?.email || "deepaka.ad24@bitsathy.ac.in"}
          onSuccess={(receipt) => {
            const { ticketId, qrToken } = bookEventTicket(
              selectedTier.eventId,
              selectedTier.tierName,
              user?.name || "Deepak Kumar",
              selectedTier.isMember,
              receipt,
            );
            setBookingSuccess(
              `Ticket Booked! Ticket #${ticketId} created with QR Pass ${qrToken}. ₹${selectedTier.price} payment verified.`,
            );
            setSelectedTier(null);
          }}
        />
      )}
    </div>
  );
};
