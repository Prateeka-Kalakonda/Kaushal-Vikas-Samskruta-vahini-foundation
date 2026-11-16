const db = require('../config/database');
const { AppError } = require('../utils/apiResponse');

// ─────────────────────────────────────────
// GET ALL BOOKMARKS FOR A USER
// ─────────────────────────────────────────
const getBookmarks = async (userId) => {
  const result = await db.query(
    `SELECT b.id, b.note, b.created_at,
            cb.id as content_block_id,
            cb.block_type, cb.title as content_title,
            cb.content, cb.order_index,
            ch.title as chapter_title,
            ch.id as chapter_id
     FROM bookmarks b
     JOIN content_blocks cb ON b.content_block_id = cb.id
     JOIN chapters ch ON cb.chapter_id = ch.id
     WHERE b.user_id = $1
     ORDER BY b.created_at DESC`,
    [userId]
  );
  return result.rows;
};

// ─────────────────────────────────────────
// ADD A BOOKMARK
// ─────────────────────────────────────────
const addBookmark = async (userId, contentBlockId, note = null) => {
  // Check if content block exists
  const block = await db.query(
    'SELECT id FROM content_blocks WHERE id = $1',
    [contentBlockId]
  );

  if (block.rows.length === 0) {
    throw new AppError('Content block not found.', 404);
  }

  // Check if already bookmarked
  const existing = await db.query(
    'SELECT id FROM bookmarks WHERE user_id = $1 AND content_block_id = $2',
    [userId, contentBlockId]
  );

  if (existing.rows.length > 0) {
    throw new AppError('You have already bookmarked this.', 409);
  }

  const result = await db.query(
    `INSERT INTO bookmarks (user_id, content_block_id, note)
     VALUES ($1, $2, $3)
     RETURNING id, content_block_id, note, created_at`,
    [userId, contentBlockId, note]
  );

  return result.rows[0];
};

// ─────────────────────────────────────────
// REMOVE A BOOKMARK
// ─────────────────────────────────────────
const removeBookmark = async (userId, bookmarkId) => {
  // Make sure the bookmark belongs to this user
  const result = await db.query(
    'DELETE FROM bookmarks WHERE id = $1 AND user_id = $2 RETURNING id',
    [bookmarkId, userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Bookmark not found or does not belong to you.', 404);
  }

  return { message: 'Bookmark removed successfully' };
};

module.exports = { getBookmarks, addBookmark, removeBookmark };