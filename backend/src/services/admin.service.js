const db = require('../config/database');
const { AppError } = require('../utils/apiResponse');

// ─────────────────────────────────────────
// SUBJECT MANAGEMENT
// ─────────────────────────────────────────
const updateSubject = async (subjectId, { name, description, icon_url, is_active }) => {
  const result = await db.query(
    `UPDATE subjects
     SET name        = COALESCE($1, name),
         description = COALESCE($2, description),
         icon_url    = COALESCE($3, icon_url),
         is_active   = COALESCE($4, is_active),
         updated_at  = NOW()
     WHERE id = $5
     RETURNING id, name, slug, description, is_active`,
    [name, description, icon_url, is_active, subjectId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Subject not found.', 404);
  }

  return result.rows[0];
};

const deleteSubject = async (subjectId) => {
  const result = await db.query(
    'DELETE FROM subjects WHERE id = $1 RETURNING id, name',
    [subjectId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Subject not found.', 404);
  }

  return { message: `Subject "${result.rows[0].name}" deleted successfully` };
};

// ─────────────────────────────────────────
// TOPIC MANAGEMENT
// ─────────────────────────────────────────
const createTopic = async ({ subject_id, name, slug, order_index }) => {
  const result = await db.query(
    `INSERT INTO topics (subject_id, name, slug, order_index)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, slug, order_index`,
    [subject_id, name, slug, order_index]
  );

  return result.rows[0];
};

const updateTopic = async (topicId, { name, slug, order_index }) => {
  const result = await db.query(
    `UPDATE topics
     SET name        = COALESCE($1, name),
         slug        = COALESCE($2, slug),
         order_index = COALESCE($3, order_index)
     WHERE id = $4
     RETURNING id, name, slug, order_index`,
    [name, slug, order_index, topicId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Topic not found.', 404);
  }

  return result.rows[0];
};

const deleteTopic = async (topicId) => {
  const result = await db.query(
    'DELETE FROM topics WHERE id = $1 RETURNING id, name',
    [topicId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Topic not found.', 404);
  }

  return { message: `Topic "${result.rows[0].name}" deleted successfully` };
};

// ─────────────────────────────────────────
// CHAPTER MANAGEMENT
// ─────────────────────────────────────────
const createChapter = async ({ lesson_id, title, chapter_num, ncert_ref, order_index }) => {
  const result = await db.query(
    `INSERT INTO chapters (lesson_id, title, chapter_num, ncert_ref, order_index)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, title, chapter_num, ncert_ref, order_index`,
    [lesson_id, title, chapter_num, ncert_ref, order_index]
  );

  return result.rows[0];
};

const updateChapter = async (chapterId, { title, chapter_num, ncert_ref, order_index }) => {
  const result = await db.query(
    `UPDATE chapters
     SET title       = COALESCE($1, title),
         chapter_num = COALESCE($2, chapter_num),
         ncert_ref   = COALESCE($3, ncert_ref),
         order_index = COALESCE($4, order_index)
     WHERE id = $5
     RETURNING id, title, chapter_num, ncert_ref`,
    [title, chapter_num, ncert_ref, order_index, chapterId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Chapter not found.', 404);
  }

  return result.rows[0];
};

const deleteChapter = async (chapterId) => {
  const result = await db.query(
    'DELETE FROM chapters WHERE id = $1 RETURNING id, title',
    [chapterId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Chapter not found.', 404);
  }

  return { message: `Chapter "${result.rows[0].title}" deleted successfully` };
};

// ─────────────────────────────────────────
// CONTENT BLOCK MANAGEMENT
// ─────────────────────────────────────────
const createContentBlock = async ({
  chapter_id,
  block_type,
  title,
  content,
  order_index,
  language,
}) => {
  const result = await db.query(
    `INSERT INTO content_blocks
      (chapter_id, block_type, title, content, order_index, language)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, block_type, title, order_index, language`,
    [chapter_id, block_type, title,
     JSON.stringify(content), order_index, language || 'en']
  );

  return result.rows[0];
};

const updateContentBlock = async (blockId, { title, content, order_index }) => {
  const result = await db.query(
    `UPDATE content_blocks
     SET title       = COALESCE($1, title),
         content     = COALESCE($2, content),
         order_index = COALESCE($3, order_index)
     WHERE id = $4
     RETURNING id, block_type, title, order_index`,
    [title, content ? JSON.stringify(content) : null, order_index, blockId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Content block not found.', 404);
  }

  return result.rows[0];
};

const deleteContentBlock = async (blockId) => {
  const result = await db.query(
    'DELETE FROM content_blocks WHERE id = $1 RETURNING id, title',
    [blockId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Content block not found.', 404);
  }

  return { message: `Content block "${result.rows[0].title}" deleted successfully` };
};

// ─────────────────────────────────────────
// DASHBOARD STATS
// ─────────────────────────────────────────
const getDashboardStats = async () => {
  const stats = await db.query(`
    SELECT
      (SELECT COUNT(*) FROM users WHERE role = 'student') as total_students,
      (SELECT COUNT(*) FROM users WHERE role = 'admin')   as total_admins,
      (SELECT COUNT(*) FROM subjects)                     as total_subjects,
      (SELECT COUNT(*) FROM topics)                       as total_topics,
      (SELECT COUNT(*) FROM chapters)                     as total_chapters,
      (SELECT COUNT(*) FROM content_blocks)               as total_content_blocks,
      (SELECT COUNT(*) FROM simulations)                  as total_simulations,
      (SELECT COUNT(*) FROM bookmarks)                    as total_bookmarks,
      (SELECT COUNT(*) FROM user_notes)                   as total_notes,
      (SELECT COUNT(*) FROM reading_progress
       WHERE completed = true)                            as total_completions
  `);

  return stats.rows[0];
};

module.exports = {
  updateSubject,
  deleteSubject,
  createTopic,
  updateTopic,
  deleteTopic,
  createChapter,
  updateChapter,
  deleteChapter,
  createContentBlock,
  updateContentBlock,
  deleteContentBlock,
  getDashboardStats,
};