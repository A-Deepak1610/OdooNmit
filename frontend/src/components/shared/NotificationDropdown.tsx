import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  X,
  Vote,
  IndianRupee,
  Calendar,
  HeartHandshake,
  Megaphone,
  Info,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import {
  useNotificationStore,
  CampusNotification,
  NotificationCategory,
} from '../../stores/notification.store';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    activeFilter,
    setActiveFilter,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    addNotification,
  } = useNotificationStore();

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter notifications
  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'UNREAD') return !n.read;
    return n.category === activeFilter;
  });

  const getCategoryIcon = (category: CampusNotification['category']) => {
    switch (category) {
      case 'ELECTION':
        return <Vote style={{ width: '15px', height: '15px', color: '#7c3aed' }} />;
      case 'FINANCE':
        return <IndianRupee style={{ width: '15px', height: '15px', color: '#15803d' }} />;
      case 'EVENT':
        return <Calendar style={{ width: '15px', height: '15px', color: '#2563eb' }} />;
      case 'VOLUNTEER':
        return <HeartHandshake style={{ width: '15px', height: '15px', color: '#0d9488' }} />;
      case 'ANNOUNCEMENT':
        return <Megaphone style={{ width: '15px', height: '15px', color: '#d97706' }} />;
      default:
        return <Info style={{ width: '15px', height: '15px', color: '#64748b' }} />;
    }
  };

  const getCategoryBadgeStyle = (category: CampusNotification['category']) => {
    switch (category) {
      case 'ELECTION':
        return { background: '#f3e8ff', color: '#6b21a8', border: '1px solid #e9d5ff' };
      case 'FINANCE':
        return { background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' };
      case 'EVENT':
        return { background: '#dbeafe', color: '#1e40af', border: '1px solid #bfdbfe' };
      case 'VOLUNTEER':
        return { background: '#ccfbf1', color: '#0f766e', border: '1px solid #99f6e4' };
      case 'ANNOUNCEMENT':
        return { background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' };
      default:
        return { background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' };
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    try {
      const diffMs = Date.now() - new Date(timestamp).getTime();
      const diffMins = Math.floor(diffMs / (60 * 1000));
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return 'Recently';
    }
  };

  const handleNotificationClick = (n: CampusNotification) => {
    markAsRead(n.id);
    onClose();
    if (n.targetUrl) {
      navigate(n.targetUrl);
    }
  };

  const handleSimulateNewAlert = (e: React.MouseEvent) => {
    e.stopPropagation();
    const mockAlerts = [
      {
        title: 'Flash Reminder: Ballot Closes Soon',
        message: 'Annual officer polls close at 5:00 PM today. Ensure your dues are settled to cast a vote.',
        category: 'ELECTION' as const,
        priority: 'HIGH' as const,
        targetUrl: '/voting',
      },
      {
        title: 'New Expense Claim Submitted',
        message: 'Member filed reimbursement receipt for Tech Workshop Snacks (₹350).',
        category: 'FINANCE' as const,
        priority: 'NORMAL' as const,
        targetUrl: '/student/expenses',
      },
      {
        title: 'Merchandise Inventory Low',
        message: 'Skyline Club Hoodie (Size M) has only 3 units remaining in stock.',
        category: 'SYSTEM' as const,
        priority: 'HIGH' as const,
        targetUrl: '/student/merchandise',
      },
    ];
    const picked = mockAlerts[Math.floor(Math.random() * mockAlerts.length)];
    addNotification(picked);
  };

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: '0',
        width: '380px',
        maxWidth: '92vw',
        backgroundColor: 'var(--card)',
        borderRadius: '14px',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.4), 0 0 0 1px var(--border)',
        border: '1px solid var(--border)',
        zIndex: 1000,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-family-body)',
        animation: 'fadeIn 0.15s ease-out',
      }}
    >
      {/* ── 1. HEADER ──────────────────────────────────────────────── */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--background)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              background: '#eff6ff',
              color: '#2563eb',
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className="dark:bg-blue-950/60 dark:text-blue-400"
          >
            <Bell style={{ width: '16px', height: '16px' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--foreground)' }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    padding: '1px 6px',
                    borderRadius: '10px',
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>
              Live updates & alerts
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              title="Mark all as read"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#2563eb',
                cursor: 'pointer',
                padding: '5px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#eff6ff')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <CheckCheck style={{ width: '14px', height: '14px' }} />
              <span>Mark read</span>
            </button>
          )}

          <button
            onClick={handleSimulateNewAlert}
            title="Simulate push alert (For judges / testing)"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#d97706',
              cursor: 'pointer',
              padding: '5px 6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fef3c7')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <Sparkles style={{ width: '15px', height: '15px' }} />
          </button>
        </div>
      </div>

      {/* ── 2. FILTER TABS ─────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          padding: '8px 12px',
          background: 'var(--background)',
          borderBottom: '1px solid var(--border)',
          overflowX: 'auto',
        }}
      >
        {(
          [
            { id: 'ALL', label: 'All' },
            { id: 'UNREAD', label: `Unread (${unreadCount})` },
            { id: 'ELECTION', label: 'Elections' },
            { id: 'FINANCE', label: 'Finance' },
            { id: 'EVENT', label: 'Events' },
            { id: 'VOLUNTEER', label: 'Volunteer' },
          ] as { id: NotificationCategory; label: string }[]
        ).map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              style={{
                border: 'none',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: isActive ? 700 : 500,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                background: isActive ? 'var(--primary)' : 'var(--secondary)',
                color: isActive ? '#ffffff' : 'var(--muted-foreground)',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── 3. NOTIFICATION LIST ───────────────────────────────────── */}
      <div
        style={{
          maxHeight: '340px',
          overflowY: 'auto',
          backgroundColor: 'var(--card)',
        }}
      >
        {filteredNotifications.length === 0 ? (
          <div
            style={{
              padding: '36px 16px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'var(--secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--muted-foreground)',
              }}
            >
              <Bell style={{ width: '20px', height: '20px' }} />
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground)' }}>
              No notifications here
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', maxWidth: '240px' }}>
              You are all caught up on announcements, ballots, and financial receipts.
            </div>
          </div>
        ) : (
          filteredNotifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid var(--border)',
                backgroundColor: n.read ? 'var(--card)' : 'var(--muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                position: 'relative',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = n.read ? 'var(--card)' : 'var(--muted)';
              }}
            >
              {/* Category Icon Container */}
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                  ...getCategoryBadgeStyle(n.category),
                }}
              >
                {getCategoryIcon(n.category)}
              </div>

              {/* Main Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                  {!n.read && (
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#2563eb',
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: n.read ? 600 : 700,
                      color: 'var(--foreground)',
                      lineHeight: '1.3',
                    }}
                  >
                    {n.title}
                  </span>
                  {n.priority === 'HIGH' && (
                    <span
                      style={{
                        fontSize: '9px',
                        fontWeight: 700,
                        backgroundColor: '#fee2e2',
                        color: '#b91c1c',
                        padding: '1px 5px',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        marginLeft: 'auto',
                      }}
                      className="dark:bg-red-950/80 dark:text-red-400"
                    >
                      Urgent
                    </span>
                  )}
                </div>

                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--muted-foreground)',
                    lineHeight: '1.4',
                    marginBottom: '6px',
                  }}
                >
                  {n.message}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', color: 'var(--muted-foreground)' }}>
                    {formatRelativeTime(n.timestamp)}
                  </span>

                  <span
                    style={{
                      fontSize: '11px',
                      color: '#2563eb',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}
                    className="dark:text-blue-400"
                  >
                    <span>Open</span>
                    <ExternalLink style={{ width: '11px', height: '11px' }} />
                  </span>
                </div>
              </div>

              {/* Dismiss Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  dismissNotification(n.id);
                }}
                title="Dismiss"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--muted-foreground)',
                  cursor: 'pointer',
                  padding: '3px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  opacity: 0.6,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.color = '#ef4444';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0.6';
                  e.currentTarget.style.color = 'var(--muted-foreground)';
                }}
              >
                <X style={{ width: '13px', height: '13px' }} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* ── 4. FOOTER ──────────────────────────────────────────────── */}
      <div
        style={{
          padding: '10px 16px',
          background: 'var(--background)',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: 'var(--muted-foreground)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#22c55e',
            }}
          />
          Campus Alert Pipeline Active
        </span>

        <button
          onClick={() => {
            onClose();
            navigate('/student/announcements');
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#2563eb',
            fontWeight: 600,
            cursor: 'pointer',
            padding: 0,
            fontSize: '11px',
          }}
          className="dark:text-blue-400"
        >
          View All Announcements →
        </button>
      </div>
    </div>
  );
};
