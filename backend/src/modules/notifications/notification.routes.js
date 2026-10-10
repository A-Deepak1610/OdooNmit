import express from 'express';

const router = express.Router();

// In-memory notifications store initialized with realistic student organization data
let notifications = [
  {
    id: 'notif-1',
    title: 'Officer Elections Voting is Live!',
    message: 'Cast your ballot for Club President, Treasurer, and Secretary. Single-ballot verification active.',
    category: 'ELECTION',
    priority: 'HIGH',
    targetUrl: '/voting',
    read: false,
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
  },
  {
    id: 'notif-2',
    title: 'Annual Membership Dues Pending',
    message: 'Renew your annual dues (₹250 via Razorpay) to maintain voter eligibility and event perks.',
    category: 'FINANCE',
    priority: 'HIGH',
    targetUrl: '/student/memberships',
    read: false,
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 mins ago
  },
  {
    id: 'notif-3',
    title: 'Spring Gala 2026 Passes Released',
    message: 'Early Bird passes are 85% claimed. Digital QR pass delivered upon checkout.',
    category: 'EVENT',
    priority: 'NORMAL',
    targetUrl: '/student/events',
    read: false,
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: 'notif-4',
    title: 'Volunteer Task Assigned',
    message: 'You have been assigned to "Manage Check-In Desk & Badge Printing" for the upcoming expo.',
    category: 'VOLUNTEER',
    priority: 'NORMAL',
    targetUrl: '/volunteer/tasks',
    read: true,
    timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(), // 5 hours ago
  },
  {
    id: 'notif-5',
    title: 'Reimbursement Approved: ₹420',
    message: 'Treasurer cleared reimbursement for Poster Printing Supplies. Bank payout scheduled.',
    category: 'FINANCE',
    priority: 'NORMAL',
    targetUrl: '/student/expenses',
    read: true,
    timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), // 1 day ago
  },
];

/**
 * @route GET /api/v1/notifications
 * @desc Get all notifications with unread count
 */
router.get('/', (req, res) => {
  const { category, unreadOnly } = req.query;

  let list = [...notifications];

  if (unreadOnly === 'true') {
    list = list.filter((n) => !n.read);
  }

  if (category && category !== 'ALL') {
    list = list.filter((n) => n.category.toUpperCase() === category.toUpperCase());
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return res.status(200).json({
    success: true,
    unreadCount,
    totalCount: notifications.length,
    notifications: list,
  });
});

/**
 * @route PATCH /api/v1/notifications/:id/read
 * @desc Mark a single notification as read
 */
router.patch('/:id/read', (req, res) => {
  const { id } = req.params;
  const notif = notifications.find((n) => n.id === id);

  if (!notif) {
    return res.status(404).json({ success: false, error: 'Notification not found' });
  }

  notif.read = true;
  const unreadCount = notifications.filter((n) => !n.read).length;

  return res.status(200).json({
    success: true,
    notification: notif,
    unreadCount,
  });
});

/**
 * @route POST /api/v1/notifications/mark-all-read
 * @desc Mark all notifications as read
 */
router.post('/mark-all-read', (_req, res) => {
  notifications = notifications.map((n) => ({ ...n, read: true }));

  return res.status(200).json({
    success: true,
    message: 'All notifications marked as read',
    unreadCount: 0,
    notifications,
  });
});

/**
 * @route DELETE /api/v1/notifications/:id
 * @desc Dismiss/delete a notification
 */
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = notifications.length;
  notifications = notifications.filter((n) => n.id !== id);

  if (notifications.length === initialLength) {
    return res.status(404).json({ success: false, error: 'Notification not found' });
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return res.status(200).json({
    success: true,
    message: 'Notification dismissed',
    unreadCount,
  });
});

/**
 * @route POST /api/v1/notifications
 * @desc Create a new notification (broadcast/trigger)
 */
router.post('/', (req, res) => {
  const { title, message, category = 'SYSTEM', priority = 'NORMAL', targetUrl = '/' } = req.body;

  if (!title || !message) {
    return res.status(400).json({ success: false, error: 'Title and message are required' });
  }

  const newNotif = {
    id: `notif-${Date.now()}`,
    title,
    message,
    category,
    priority,
    targetUrl,
    read: false,
    timestamp: new Date().toISOString(),
  };

  notifications.unshift(newNotif);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return res.status(201).json({
    success: true,
    notification: newNotif,
    unreadCount,
  });
});

export default router;
