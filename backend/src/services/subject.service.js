const db = require('../config/database');
const { AppError } = require('../utils/apiResponse');

// ─────────────────────────────────────────
// GET ALL SUBJECTS
// ─────────────────────────────────────────
const getAllSubjects = async () => {
  const result = await db.query(
    `SELECT id, name, slug, class_level, description, icon_url
     FROM subjects
     WHERE is_active = true
     ORDER BY class_level, name`
  );
  return result.rows;
};

// ─────────────────────────────────────────
// GET SINGLE SUBJECT BY SLUG
// ─────────────────────────────────────────
const getSubjectBySlug = async (slug) => {
  const result = await db.query(
    `SELECT id, name, slug, class_level, description, icon_url
     FROM subjects
     WHERE slug = $1 AND is_active = true`,
    [slug]
  );

  if (result.rows.length === 0) {
    throw new AppError('Subject not found.', 404);
  }

  return result.rows[0];
};

// ─────────────────────────────────────────
// GET TOPICS FOR A SUBJECT
// ─────────────────────────────────────────
const getTopicsBySubject = async (slug) => {
  // First check if subject exists
  const subject = await getSubjectBySlug(slug);

  const result = await db.query(
    `SELECT t.id, t.name, t.slug, t.order_index
     FROM topics t
     WHERE t.subject_id = $1
     ORDER BY t.order_index`,
    [subject.id]
  );

  return { subject, topics: result.rows };
};

// ─────────────────────────────────────────
// GET LESSONS FOR A TOPIC
// ─────────────────────────────────────────
const getLessonsByTopic = async (topicId) => {
  // Check if topic exists
  const topicResult = await db.query(
    `SELECT t.id, t.name, t.slug, s.name as subject_name
     FROM topics t
     JOIN subjects s ON t.subject_id = s.id
     WHERE t.id = $1`,
    [topicId]
  );

  if (topicResult.rows.length === 0) {
    throw new AppError('Topic not found.', 404);
  }

  const topic = topicResult.rows[0];

  // Get all lessons for this topic
  const lessonsResult = await db.query(
    `SELECT id, title, slug, order_index
     FROM lessons
     WHERE topic_id = $1
     ORDER BY order_index`,
    [topicId]
  );

  return { topic, lessons: lessonsResult.rows };
};

// ─────────────────────────────────────────
// GET CHAPTER WITH ALL CONTENT BLOCKS
// ─────────────────────────────────────────
const getChapterWithContent = async (chapterId) => {
  // Get chapter details
  const chapterResult = await db.query(
    `SELECT ch.id, ch.title, ch.chapter_num, ch.ncert_ref,
            l.title as lesson_title,
            t.name as topic_name,
            s.name as subject_name
     FROM chapters ch
     JOIN lessons l ON ch.lesson_id = l.id
     JOIN topics t ON l.topic_id = t.id
     JOIN subjects s ON t.subject_id = s.id
     WHERE ch.id = $1`,
    [chapterId]
  );

  if (chapterResult.rows.length === 0) {
    throw new AppError('Chapter not found.', 404);
  }

  const chapter = chapterResult.rows[0];

  // Get all content blocks for this chapter
  const contentResult = await db.query(
    `SELECT id, block_type, title, content, order_index, language
     FROM content_blocks
     WHERE chapter_id = $1
     ORDER BY order_index`,
    [chapterId]
  );

  return { chapter, content_blocks: contentResult.rows };
};

// ─────────────────────────────────────────
// CREATE SUBJECT (admin only)
// ─────────────────────────────────────────
const createSubject = async ({ name, slug, class_level, description }) => {
  // Check if slug already exists
  const existing = await db.query(
    'SELECT id FROM subjects WHERE slug = $1',
    [slug]
  );

  if (existing.rows.length > 0) {
    throw new AppError('A subject with this slug already exists.', 409);
  }

  const result = await db.query(
    `INSERT INTO subjects (name, slug, class_level, description)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, slug, class_level, description, created_at`,
    [name, slug, class_level, description]
  );

  return result.rows[0];
};

module.exports = {
  getAllSubjects,
  getSubjectBySlug,
  getTopicsBySubject,
  getLessonsByTopic,
  getChapterWithContent,
  createSubject,
};