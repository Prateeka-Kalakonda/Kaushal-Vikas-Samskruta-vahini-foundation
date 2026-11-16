const express = require('express');
const router = express.Router();

const announcementController = require('../controllers/announcement.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

// ─────────────────────────────────────────
// IMPORTANT: specific routes must come
// BEFORE dynamic routes like /:id
// ─────────────────────────────────────────

// ─────────────────────────────────────────
// ADMIN ONLY ROUTES
// Placed first to avoid conflict with /:id
// ─────────────────────────────────────────

// GET /api/v1/announcements/all
// Get all announcements regardless of role
router.get(
  '/all',
  authenticate,
  requireRole('admin'),
  announcementController.getAllAnnouncements
);

// POST /api/v1/announcements
// Create new announcement
router.post(
  '/',
  authenticate,
  requireRole('admin'),
  announcementController.createAnnouncement
);

// ─────────────────────────────────────────
// PROTECTED ROUTES (all roles)
// ─────────────────────────────────────────

// GET /api/v1/announcements
// Get announcements for logged in user
router.get(
  '/',
  authenticate,
  announcementController.getAnnouncements
);

// GET /api/v1/announcements/unread-count
// Get unread announcements count
// Must be BEFORE /:id
router.get(
  '/unread-count',
  authenticate,
  announcementController.getUnreadCount
);

// GET /api/v1/announcements/:id
// Get single announcement
router.get(
  '/:id',
  authenticate,
  announcementController.getAnnouncementById
);

// PUT /api/v1/announcements/:id
// Update announcement (admin only)
router.put(
  '/:id',
  authenticate,
  requireRole('admin'),
  announcementController.updateAnnouncement
);

// DELETE /api/v1/announcements/:id
// Delete announcement (admin only)
router.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  announcementController.deleteAnnouncement
);

module.exports = router;