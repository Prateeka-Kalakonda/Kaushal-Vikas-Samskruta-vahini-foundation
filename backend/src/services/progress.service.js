const db = require('../config/database');
const { AppError } = require('../utils/apiResponse');

// ─────────────────────────────────────────
// UPDATE READING PROGRESS
// ─────────────────────────────────────────
const updateProgress = async (userId, { chapter_id, last_block_id, progress_pct }) => {
  const result = await db.query(
    `INSERT INTO reading_progress
      (user_id, chapter_id, last_block_id, progress_pct, last_read_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (user_id, chapter_id)
     DO UPDATE SET
       last_block_id = EXCLUDED.last_block_id,
       progress_pct  = EXCLUDED.progress_pct,
       completed     = CASE
                         WHEN EXCLUDED.progress_pct >= 100 THEN true
                         ELSE reading_progress.completed
                       END,
       last_read_at  = NOW()
     RETURNING id, chapter_id, progress_pct, completed, last_read_at`,
    [userId, chapter_id, last_block_id, progress_pct]
  );

  return result.rows[0];
};

// ─────────────────────────────────────────
// GET CONTINUE READING
// ─────────────────────────────────────────
const getContinueReading = async (userId) => {
  const result = await db.query(
    `SELECT
       rp.id, rp.progress_pct, rp.completed, rp.last_read_at,
       ch.id as chapter_id, ch.title as chapter_title, ch.chapter_num,
       l.title as lesson_title,
       t.name as topic_name,
       s.name as subject_name, s.slug as subject_slug
     FROM reading_progress rp
     JOIN chapters ch ON rp.chapter_id = ch.id
     JOIN lessons l ON ch.lesson_id = l.id
     JOIN topics t ON l.topic_id = t.id
     JOIN subjects s ON t.subject_id = s.id
     WHERE rp.user_id = $1
       AND rp.completed = false
     ORDER BY rp.last_read_at DESC
     LIMIT 5`,
    [userId]
  );

  return result.rows;
};

// ─────────────────────────────────────────
// GET PROGRESS FOR A SPECIFIC CHAPTER
// ─────────────────────────────────────────
const getChapterProgress = async (userId, chapterId) => {
  const result = await db.query(
    `SELECT id, progress_pct, completed, last_block_id, last_read_at
     FROM reading_progress
     WHERE user_id = $1 AND chapter_id = $2`,
    [userId, chapterId]
  );

  if (result.rows.length === 0) {
    return { progress_pct: 0, completed: false, last_block_id: null };
  }

  return result.rows[0];
};

// ─────────────────────────────────────────
// GET ALL COMPLETED CHAPTERS
// ─────────────────────────────────────────
const getCompletedChapters = async (userId) => {
  const result = await db.query(
    `SELECT
       ch.id as chapter_id, ch.title as chapter_title,
       rp.progress_pct, rp.last_read_at,
       s.name as subject_name
     FROM reading_progress rp
     JOIN chapters ch ON rp.chapter_id = ch.id
     JOIN lessons l ON ch.lesson_id = l.id
     JOIN topics t ON l.topic_id = t.id
     JOIN subjects s ON t.subject_id = s.id
     WHERE rp.user_id = $1 AND rp.completed = true
     ORDER BY rp.last_read_at DESC`,
    [userId]
  );

  return result.rows;
};

// ─────────────────────────────────────────
// GET CURRICULUM MASTERY
// Returns overall mastery percentage
// and total chapters validated/completed
// ─────────────────────────────────────────
const getCurriculumMastery = async (userId) => {

  // Get total chapters in the platform
  const totalChaptersResult = await db.query(
    'SELECT COUNT(*) as total FROM chapters'
  );
  const totalChapters = parseInt(totalChaptersResult.rows[0].total);

  // Get chapters completed by this student
  const completedResult = await db.query(
    `SELECT COUNT(*) as completed
     FROM reading_progress
     WHERE user_id = $1 AND completed = true`,
    [userId]
  );
  const completedChapters = parseInt(completedResult.rows[0].completed);

  // Get chapters in progress by this student
  const inProgressResult = await db.query(
    `SELECT COUNT(*) as in_progress
     FROM reading_progress
     WHERE user_id = $1 AND completed = false AND progress_pct > 0`,
    [userId]
  );
  const inProgressChapters = parseInt(inProgressResult.rows[0].in_progress);

  // Calculate mastery percentage
  // Formula: (completed chapters / total chapters) * 100
  const masteryPercentage = totalChapters > 0
    ? Math.round((completedChapters / totalChapters) * 100)
    : 0;

  // Get subject wise progress breakdown
  const subjectProgressResult = await db.query(
    `SELECT
       s.name as subject_name,
       s.slug as subject_slug,
       COUNT(ch.id) as total_chapters,
       COUNT(rp.id) FILTER (WHERE rp.completed = true) as completed_chapters,
       ROUND(
         COUNT(rp.id) FILTER (WHERE rp.completed = true)::numeric
         / NULLIF(COUNT(ch.id), 0) * 100
       ) as subject_mastery_pct
     FROM subjects s
     JOIN topics t ON t.subject_id = s.id
     JOIN lessons l ON l.topic_id = t.id
     JOIN chapters ch ON ch.lesson_id = l.id
     LEFT JOIN reading_progress rp
       ON rp.chapter_id = ch.id AND rp.user_id = $1
     GROUP BY s.id, s.name, s.slug
     ORDER BY s.name`,
    [userId]
  );

  return {
    mastery_percentage: masteryPercentage,
    chapters_validated: completedChapters,
    chapters_in_progress: inProgressChapters,
    total_chapters: totalChapters,
    subject_breakdown: subjectProgressResult.rows,
  };
};

module.exports = {
  updateProgress,
  getContinueReading,
  getChapterProgress,
  getCompletedChapters,
  getCurriculumMastery,
};