const announcementService = require('../services/announcement.service');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// ─────────────────────────────────────────
// GET ANNOUNCEMENTS FOR LOGGED IN USER
// GET /api/v1/announcements
// Protected — all roles
// Returns announcements targeted at their role
// ─────────────────────────────────────────
const getAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await announcementService.getAnnouncements(
    req.user.role
  );
  return success(res, { announcements }, 'Announcements fetched successfully!');
});

// ─────────────────────────────────────────
// GET ALL ANNOUNCEMENTS (admin only)
// GET /api/v1/announcements/all
// ─────────────────────────────────────────
const getAllAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await announcementService.getAllAnnouncements();
  return success(res, { announcements }, 'All announcements fetched successfully!');
});

// ─────────────────────────────────────────
// GET SINGLE ANNOUNCEMENT
// GET /api/v1/announcements/:id
// ─────────────────────────────────────────
const getAnnouncementById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const announcement = await announcementService.getAnnouncementById(id);
  return success(res, { announcement }, 'Announcement fetched successfully!');
});

// ─────────────────────────────────────────
// GET UNREAD COUNT
// GET /api/v1/announcements/unread-count
// Protected — all roles
// ─────────────────────────────────────────
const getUnreadCount = asyncHandler(async (req, res) => {
  const data = await announcementService.getUnreadCount(req.user.role);
  return success(res, data, 'Unread count fetched successfully!');
});

// ─────────────────────────────────────────
// CREATE ANNOUNCEMENT (admin only)
// POST /api/v1/announcements
// ─────────────────────────────────────────
const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, message, target_role } = req.body;

  const announcement = await announcementService.createAnnouncement(
    req.user.id,
    { title, message, target_role }
  );

  return success(
    res,
    { announcement },
    'Announcement created successfully!',
    201
  );
});

// ─────────────────────────────────────────
// UPDATE ANNOUNCEMENT (admin only)
// PUT /api/v1/announcements/:id
// ─────────────────────────────────────────
const updateAnnouncement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, message, target_role, is_active } = req.body;

  const announcement = await announcementService.updateAnnouncement(id, {
    title,
    message,
    target_role,
    is_active,
  });

  return success(res, { announcement }, 'Announcement updated successfully!');
});

// ─────────────────────────────────────────
// DELETE ANNOUNCEMENT (admin only)
// DELETE /api/v1/announcements/:id
// ─────────────────────────────────────────
const deleteAnnouncement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await announcementService.deleteAnnouncement(id);
  return success(res, result, 'Announcement deleted successfully!');
});

module.exports = {
  getAnnouncements,
  getAllAnnouncements,
  getAnnouncementById,
  getUnreadCount,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};