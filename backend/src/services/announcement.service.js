const db = require('../config/database');
const { AppError } = require('../utils/apiResponse');

// ─────────────────────────────────────────
// GET ANNOUNCEMENTS FOR LOGGED IN USER
// Returns announcements targeted at their role
// ─────────────────────────────────────────
const getAnnouncements = async (userRole) => {
  const result = await db.query(
    `SELECT
       a.id, a.title, a.message,
       a.target_role, a.created_at,
       u.full_name as created_by_name
     FROM announcements a
     JOIN users u ON a.created_by = u.id
     WHERE a.is_active = true
       AND (a.target_role = $1 OR a.target_role = 'all')
     ORDER BY a.created_at DESC`,
    [userRole]
  );

  return result.rows;
};

// ─────────────────────────────────────────
// GET ALL ANNOUNCEMENTS (admin only)
// Returns all announcements regardless of role
// ─────────────────────────────────────────
const getAllAnnouncements = async () => {
  const result = await db.query(
    `SELECT
       a.id, a.title, a.message,
       a.target_role, a.is_active, a.created_at,
       u.full_name as created_by_name
     FROM announcements a
     JOIN users u ON a.created_by = u.id
     ORDER BY a.created_at DESC`
  );

  return result.rows;
};

// ─────────────────────────────────────────
// GET SINGLE ANNOUNCEMENT BY ID
// ─────────────────────────────────────────
const getAnnouncementById = async (announcementId) => {
  const result = await db.query(
    `SELECT
       a.id, a.title, a.message,
       a.target_role, a.is_active, a.created_at,
       u.full_name as created_by_name
     FROM announcements a
     JOIN users u ON a.created_by = u.id
     WHERE a.id = $1`,
    [announcementId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Announcement not found.', 404);
  }

  return result.rows[0];
};

// ─────────────────────────────────────────
// CREATE ANNOUNCEMENT (admin only)
// ─────────────────────────────────────────
const createAnnouncement = async (adminId, { title, message, target_role }) => {

  // Validate target_role
  const validRoles = ['student', 'mentor', 'admin', 'all'];
  if (!validRoles.includes(target_role)) {
    throw new AppError(
      `Invalid target role. Use: ${validRoles.join(', ')}`,
      400
    );
  }

  const result = await db.query(
    `INSERT INTO announcements
      (title, message, created_by, target_role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, title, message, target_role, created_at`,
    [title, message, adminId, target_role]
  );

  return result.rows[0];
};

// ─────────────────────────────────────────
// UPDATE ANNOUNCEMENT (admin only)
// ─────────────────────────────────────────
const updateAnnouncement = async (announcementId, { title, message, target_role, is_active }) => {

  const result = await db.query(
    `UPDATE announcements
     SET title       = COALESCE($1, title),
         message     = COALESCE($2, message),
         target_role = COALESCE($3, target_role),
         is_active   = COALESCE($4, is_active),
         updated_at  = NOW()
     WHERE id = $5
     RETURNING id, title, message, target_role, is_active`,
    [title, message, target_role, is_active, announcementId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Announcement not found.', 404);
  }

  return result.rows[0];
};

// ─────────────────────────────────────────
// DELETE ANNOUNCEMENT (admin only)
// ─────────────────────────────────────────
const deleteAnnouncement = async (announcementId) => {
  const result = await db.query(
    'DELETE FROM announcements WHERE id = $1 RETURNING id, title',
    [announcementId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Announcement not found.', 404);
  }

  return { message: `Announcement "${result.rows[0].title}" deleted successfully` };
};

// ─────────────────────────────────────────
// GET UNREAD COUNT FOR USER
// Returns number of announcements since
// the user last checked
// ─────────────────────────────────────────
const getUnreadCount = async (userRole) => {
  // Get announcements from last 7 days
  const result = await db.query(
    `SELECT COUNT(*) as unread_count
     FROM announcements
     WHERE is_active = true
       AND (target_role = $1 OR target_role = 'all')
       AND created_at >= NOW() - INTERVAL '7 days'`,
    [userRole]
  );

  return {
    unread_count: parseInt(result.rows[0].unread_count),
  };
};

module.exports = {
  getAnnouncements,
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getUnreadCount,
};