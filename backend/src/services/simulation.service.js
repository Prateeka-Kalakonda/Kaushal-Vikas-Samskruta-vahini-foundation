const db = require('../config/database');
const { AppError } = require('../utils/apiResponse');

// ─────────────────────────────────────────
// GET ALL SIMULATIONS
// For Simulations sidebar page
// Latest first + total count
// ─────────────────────────────────────────
const getAllSimulations = async () => {
  const countResult = await db.query(
    'SELECT COUNT(*) as total FROM simulations WHERE is_active = true'
  );
  const totalCount = parseInt(countResult.rows[0].total);

  const result = await db.query(
    `SELECT
       s.id, s.title, s.description, s.sim_type,
       s.renderer, s.thumbnail_url, s.is_active,
       s.difficulty, s.duration_mins, s.tags,
       s.created_at,
       ch.title as chapter_title,
       t.name as topic_name,
       t.id as topic_id,
       subj.name as subject_name,
       subj.slug as subject_slug
     FROM simulations s
     JOIN chapters ch ON s.chapter_id = ch.id
     JOIN lessons l ON ch.lesson_id = l.id
     JOIN topics t ON l.topic_id = t.id
     JOIN subjects subj ON t.subject_id = subj.id
     WHERE s.is_active = true
     ORDER BY s.created_at DESC`
  );

  return {
    total_count: totalCount,
    simulations: result.rows,
  };
};

// ─────────────────────────────────────────
// GET ALL SIMULATIONS FOR A CHAPTER
// ─────────────────────────────────────────
const getSimulationsByChapter = async (chapterId) => {
  const result = await db.query(
    `SELECT
       s.id, s.title, s.description, s.sim_type,
       s.renderer, s.thumbnail_url, s.is_active,
       s.difficulty, s.duration_mins, s.tags,
       ch.title as chapter_title
     FROM simulations s
     JOIN chapters ch ON s.chapter_id = ch.id
     WHERE s.chapter_id = $1 AND s.is_active = true
     ORDER BY s.created_at DESC`,
    [chapterId]
  );
  return result.rows;
};

// ─────────────────────────────────────────
// GET SIMULATIONS BY TOPIC
// For Experiments sidebar page
// Segregated by topic with count
// ─────────────────────────────────────────
const getSimulationsByTopic = async (topicId) => {
  const topicResult = await db.query(
    `SELECT t.id, t.name, t.slug,
            s.name as subject_name,
            s.slug as subject_slug
     FROM topics t
     JOIN subjects s ON t.subject_id = s.id
     WHERE t.id = $1`,
    [topicId]
  );

  if (topicResult.rows.length === 0) {
    throw new AppError('Topic not found.', 404);
  }

  const topic = topicResult.rows[0];

  const simsResult = await db.query(
    `SELECT
       s.id, s.title, s.description, s.sim_type,
       s.renderer, s.thumbnail_url, s.difficulty,
       s.duration_mins, s.created_at,
       ch.title as chapter_title
     FROM simulations s
     JOIN chapters ch ON s.chapter_id = ch.id
     JOIN lessons l ON ch.lesson_id = l.id
     WHERE l.topic_id = $1 AND s.is_active = true
     ORDER BY s.created_at DESC`,
    [topicId]
  );

  return {
    topic,
    simulation_count: simsResult.rows.length,
    simulations: simsResult.rows,
  };
};

// ─────────────────────────────────────────
// GET TOPICS WITH SIMULATION COUNTS
// For Experiments page topic list
// Shows count beside each topic name
// e.g. "Mechanics (3)"
// ─────────────────────────────────────────
const getTopicsWithSimulationCounts = async (subjectSlug) => {
  let query;
  let params;

  if (subjectSlug) {
    query = `
      SELECT
        t.id, t.name, t.slug, t.order_index,
        s.name as subject_name,
        s.slug as subject_slug,
        COUNT(sim.id) as simulation_count
      FROM topics t
      JOIN subjects s ON t.subject_id = s.id
      LEFT JOIN lessons l ON l.topic_id = t.id
      LEFT JOIN chapters ch ON ch.lesson_id = l.id
      LEFT JOIN simulations sim ON sim.chapter_id = ch.id
        AND sim.is_active = true
      WHERE s.slug = $1
      GROUP BY t.id, t.name, t.slug, t.order_index,
               s.name, s.slug
      ORDER BY t.order_index ASC`;
    params = [subjectSlug];
  } else {
    query = `
      SELECT
        t.id, t.name, t.slug, t.order_index,
        s.name as subject_name,
        s.slug as subject_slug,
        COUNT(sim.id) as simulation_count
      FROM topics t
      JOIN subjects s ON t.subject_id = s.id
      LEFT JOIN lessons l ON l.topic_id = t.id
      LEFT JOIN chapters ch ON ch.lesson_id = l.id
      LEFT JOIN simulations sim ON sim.chapter_id = ch.id
        AND sim.is_active = true
      GROUP BY t.id, t.name, t.slug, t.order_index,
               s.name, s.slug
      ORDER BY s.name, t.order_index ASC`;
    params = [];
  }

  const result = await db.query(query, params);
  return result.rows;
};

// ─────────────────────────────────────────
// GET SUBJECTS WITH CATEGORIES
// For top navigation bar
// Science → Physics, Chemistry, Biology
// ─────────────────────────────────────────
const getSubjectsWithCategories = async () => {
  const result = await db.query(
    `SELECT
       c.id as category_id,
       c.name as category_name,
       c.slug as category_slug,
       c.icon as category_icon,
       c.order_index as category_order,
       s.id as subject_id,
       s.name as subject_name,
       s.slug as subject_slug,
       s.class_level
     FROM categories c
     LEFT JOIN subjects s ON s.category_id = c.id
       AND s.is_active = true
     WHERE c.is_active = true
     ORDER BY c.order_index, s.name`
  );

  const categoriesMap = {};
  result.rows.forEach(row => {
    if (!categoriesMap[row.category_id]) {
      categoriesMap[row.category_id] = {
        id: row.category_id,
        name: row.category_name,
        slug: row.category_slug,
        icon: row.category_icon,
        order_index: row.category_order,
        subjects: [],
      };
    }
    if (row.subject_id) {
      categoriesMap[row.category_id].subjects.push({
        id: row.subject_id,
        name: row.subject_name,
        slug: row.subject_slug,
        class_level: row.class_level,
      });
    }
  });

  return Object.values(categoriesMap).sort(
    (a, b) => a.order_index - b.order_index
  );
};

// ─────────────────────────────────────────
// GET SINGLE SIMULATION WITH FULL PAGE CONTENT
// ─────────────────────────────────────────
const getSimulationById = async (simId) => {
  const result = await db.query(
    `SELECT
       s.id, s.title, s.description,
       s.sim_type, s.renderer, s.config,
       s.thumbnail_url, s.theory,
       s.how_to_use, s.learning_outcomes,
       s.difficulty, s.duration_mins, s.tags,
       ch.title as chapter_title,
       ch.id as chapter_id,
       ch.chapter_num,
       l.title as lesson_title,
       t.name as topic_name,
       t.id as topic_id,
       subj.name as subject_name,
       subj.slug as subject_slug
     FROM simulations s
     JOIN chapters ch ON s.chapter_id = ch.id
     JOIN lessons l ON ch.lesson_id = l.id
     JOIN topics t ON l.topic_id = t.id
     JOIN subjects subj ON t.subject_id = subj.id
     WHERE s.id = $1 AND s.is_active = true`,
    [simId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Simulation not found.', 404);
  }

  const simulation = result.rows[0];

  // Get full page sections
  const pagesResult = await db.query(
    `SELECT id, section_type, title, content, latex, order_index
     FROM simulation_pages
     WHERE simulation_id = $1
     ORDER BY order_index ASC`,
    [simId]
  );

  // Get simulation notes
  const notesResult = await db.query(
    `SELECT id, title, content, note_type, order_index
     FROM simulation_notes
     WHERE simulation_id = $1
     ORDER BY order_index ASC`,
    [simId]
  );

  // Get linked experiment if any
  const experimentResult = await db.query(
    `SELECT id, title, description, experiment_type, difficulty
     FROM experiments
     WHERE simulation_id = $1 AND is_active = true
     LIMIT 1`,
    [simId]
  );

  return {
    ...simulation,
    page_sections: pagesResult.rows,
    notes: notesResult.rows,
    linked_experiment: experimentResult.rows[0] || null,
  };
};

// ─────────────────────────────────────────
// CREATE SIMULATION (admin only)
// ─────────────────────────────────────────
const createSimulation = async ({
  chapter_id,
  title,
  description,
  sim_type,
  renderer,
  config,
  thumbnail_url,
  theory,
  how_to_use,
  difficulty,
  duration_mins,
  tags,
}) => {
  // Get topic_id automatically from chapter
  const chapterResult = await db.query(
    `SELECT ch.id, l.topic_id
     FROM chapters ch
     JOIN lessons l ON ch.lesson_id = l.id
     WHERE ch.id = $1`,
    [chapter_id]
  );

  if (chapterResult.rows.length === 0) {
    throw new AppError('Chapter not found.', 404);
  }

  const topicId = chapterResult.rows[0].topic_id;

  const result = await db.query(
    `INSERT INTO simulations
      (chapter_id, topic_id, title, description, sim_type,
       renderer, config, thumbnail_url, theory, how_to_use,
       difficulty, duration_mins, tags)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING id, title, sim_type, renderer, difficulty,
               duration_mins, created_at`,
    [
      chapter_id, topicId, title, description, sim_type,
      renderer, JSON.stringify(config), thumbnail_url,
      theory, how_to_use,
      difficulty || 'medium',
      duration_mins || 15,
      JSON.stringify(tags || [])
    ]
  );

  return result.rows[0];
};

// ─────────────────────────────────────────
// SAVE SIMULATION SESSION (student)
// ─────────────────────────────────────────
const saveSimulationSession = async (userId, simId, sessionData, durationSec) => {
  const sim = await db.query(
    'SELECT id FROM simulations WHERE id = $1',
    [simId]
  );

  if (sim.rows.length === 0) {
    throw new AppError('Simulation not found.', 404);
  }

  const result = await db.query(
    `INSERT INTO simulation_interactions
      (user_id, simulation_id, session_data, duration_sec)
     VALUES ($1, $2, $3, $4)
     RETURNING id, duration_sec, interacted_at`,
    [userId, simId, JSON.stringify(sessionData), durationSec]
  );

  return result.rows[0];
};

// ─────────────────────────────────────────
// GET STUDENT SIMULATION HISTORY
// ─────────────────────────────────────────
const getSimulationHistory = async (userId) => {
  const result = await db.query(
    `SELECT si.id, si.duration_sec, si.interacted_at,
            s.title as simulation_title,
            s.sim_type, s.renderer,
            ch.title as chapter_title
     FROM simulation_interactions si
     JOIN simulations s ON si.simulation_id = s.id
     JOIN chapters ch ON s.chapter_id = ch.id
     WHERE si.user_id = $1
     ORDER BY si.interacted_at DESC
     LIMIT 20`,
    [userId]
  );

  return result.rows;
};

// ─────────────────────────────────────────
// GET SIMULATION NOTES
// ─────────────────────────────────────────
const getSimulationNotes = async (simId) => {
  const sim = await db.query(
    'SELECT id FROM simulations WHERE id = $1',
    [simId]
  );

  if (sim.rows.length === 0) {
    throw new AppError('Simulation not found.', 404);
  }

  const result = await db.query(
    `SELECT
       sn.id, sn.title, sn.content,
       sn.note_type, sn.order_index,
       sn.created_at
     FROM simulation_notes sn
     WHERE sn.simulation_id = $1
     ORDER BY sn.order_index ASC`,
    [simId]
  );

  return result.rows;
};

// ─────────────────────────────────────────
// ADD SIMULATION NOTE (admin only)
// ─────────────────────────────────────────
const addSimulationNote = async (adminId, simId, {
  title,
  content,
  note_type,
  order_index,
}) => {
  const sim = await db.query(
    'SELECT id FROM simulations WHERE id = $1',
    [simId]
  );

  if (sim.rows.length === 0) {
    throw new AppError('Simulation not found.', 404);
  }

  const result = await db.query(
    `INSERT INTO simulation_notes
      (simulation_id, title, content, note_type, order_index, created_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, title, content, note_type, order_index, created_at`,
    [simId, title, content, note_type || 'theory', order_index || 0, adminId]
  );

  return result.rows[0];
};

// ─────────────────────────────────────────
// UPDATE SIMULATION NOTE (admin only)
// ─────────────────────────────────────────
const updateSimulationNote = async (noteId, { title, content, note_type, order_index }) => {
  const result = await db.query(
    `UPDATE simulation_notes
     SET title       = COALESCE($1, title),
         content     = COALESCE($2, content),
         note_type   = COALESCE($3, note_type),
         order_index = COALESCE($4, order_index),
         updated_at  = NOW()
     WHERE id = $5
     RETURNING id, title, content, note_type, order_index`,
    [title, content, note_type, order_index, noteId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Simulation note not found.', 404);
  }

  return result.rows[0];
};

// ─────────────────────────────────────────
// DELETE SIMULATION NOTE (admin only)
// ─────────────────────────────────────────
const deleteSimulationNote = async (noteId) => {
  const result = await db.query(
    'DELETE FROM simulation_notes WHERE id = $1 RETURNING id, title',
    [noteId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Simulation note not found.', 404);
  }

  return { message: `Note "${result.rows[0].title}" deleted successfully` };
};

// ─────────────────────────────────────────
// ADD SIMULATION PAGE SECTION (admin only)
// ─────────────────────────────────────────
const addSimulationPage = async (adminId, simId, {
  section_type,
  title,
  content,
  latex,
  order_index,
}) => {
  const sim = await db.query(
    'SELECT id FROM simulations WHERE id = $1',
    [simId]
  );

  if (sim.rows.length === 0) {
    throw new AppError('Simulation not found.', 404);
  }

  const result = await db.query(
    `INSERT INTO simulation_pages
      (simulation_id, section_type, title, content, latex, order_index, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, section_type, title, content, latex, order_index`,
    [simId, section_type, title, content, latex, order_index || 0, adminId]
  );

  return result.rows[0];
};

// ─────────────────────────────────────────
// UPDATE SIMULATION PAGE SECTION (admin only)
// ─────────────────────────────────────────
const updateSimulationPage = async (pageId, { title, content, latex, order_index }) => {
  const result = await db.query(
    `UPDATE simulation_pages
     SET title       = COALESCE($1, title),
         content     = COALESCE($2, content),
         latex       = COALESCE($3, latex),
         order_index = COALESCE($4, order_index),
         updated_at  = NOW()
     WHERE id = $5
     RETURNING id, section_type, title, content, latex, order_index`,
    [title, content, latex, order_index, pageId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Page section not found.', 404);
  }

  return result.rows[0];
};

// ─────────────────────────────────────────
// DELETE SIMULATION PAGE SECTION (admin only)
// ─────────────────────────────────────────
const deleteSimulationPage = async (pageId) => {
  const result = await db.query(
    'DELETE FROM simulation_pages WHERE id = $1 RETURNING id, title',
    [pageId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Page section not found.', 404);
  }

  return { message: `Section "${result.rows[0].title}" deleted successfully` };
};

module.exports = {
  getAllSimulations,
  getSimulationsByChapter,
  getSimulationsByTopic,
  getTopicsWithSimulationCounts,
  getSubjectsWithCategories,
  getSimulationById,
  createSimulation,
  saveSimulationSession,
  getSimulationHistory,
  getSimulationNotes,
  addSimulationNote,
  updateSimulationNote,
  deleteSimulationNote,
  addSimulationPage,
  updateSimulationPage,
  deleteSimulationPage,
};