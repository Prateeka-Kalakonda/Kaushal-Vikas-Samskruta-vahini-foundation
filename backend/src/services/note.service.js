const db = require('../config/database');
const { AppError } = require('../utils/apiResponse');

// ─────────────────────────────────────────
// GET ALL NOTES FOR A USER
// ─────────────────────────────────────────
const getNotes = async (userId) => {
  const result = await db.query(
    `SELECT n.id, n.highlighted_text, n.note_text, n.color,
            n.created_at, n.updated_at,
            cb.id as content_block_id,
            cb.title as content_title,
            ch.title as chapter_title
     FROM user_notes n
     JOIN content_blocks cb ON n.content_block_id = cb.id
     JOIN chapters ch ON cb.chapter_id = ch.id
     WHERE n.user_id = $1
     ORDER BY n.created_at DESC`,
    [userId]
  );
  return result.rows;
};

// ─────────────────────────────────────────
// ADD A NOTE
// ─────────────────────────────────────────
const addNote = async (userId, { content_block_id, highlighted_text, note_text, color = 'yellow' }) => {
  // Check if content block exists
  const block = await db.query(
    'SELECT id FROM content_blocks WHERE id = $1',
    [content_block_id]
  );

  if (block.rows.length === 0) {
    throw new AppError('Content block not found.', 404);
  }

  const result = await db.query(
    `INSERT INTO user_notes
      (user_id, content_block_id, highlighted_text, note_text, color)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, content_block_id, highlighted_text, note_text, color, created_at`,
    [userId, content_block_id, highlighted_text, note_text, color]
  );

  return result.rows[0];
};

// ─────────────────────────────────────────
// UPDATE A NOTE
// ─────────────────────────────────────────
const updateNote = async (userId, noteId, { note_text, color }) => {
  const result = await db.query(
    `UPDATE user_notes
     SET note_text = COALESCE($1, note_text),
         color = COALESCE($2, color),
         updated_at = NOW()
     WHERE id = $3 AND user_id = $4
     RETURNING id, note_text, color, updated_at`,
    [note_text, color, noteId, userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Note not found or does not belong to you.', 404);
  }

  return result.rows[0];
};

// ─────────────────────────────────────────
// DELETE A NOTE
// ─────────────────────────────────────────
const deleteNote = async (userId, noteId) => {
  const result = await db.query(
    'DELETE FROM user_notes WHERE id = $1 AND user_id = $2 RETURNING id',
    [noteId, userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Note not found or does not belong to you.', 404);
  }

  return { message: 'Note deleted successfully' };
};

module.exports = { getNotes, addNote, updateNote, deleteNote };