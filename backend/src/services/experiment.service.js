const db = require('../config/database');
const { AppError } = require('../utils/apiResponse');

// ─────────────────────────────────────────
// GET ALL EXPERIMENTS
// ─────────────────────────────────────────
const getAllExperiments = async () => {
  const result = await db.query(
    `SELECT
       e.id, e.title, e.description,
       e.experiment_type, e.difficulty,
       e.duration_mins, e.is_active,
       e.created_at,
       s.name as subject_name,
       s.slug as subject_slug,
       ch.title as chapter_title
     FROM experiments e
     LEFT JOIN subjects s ON e.subject_id = s.id
     LEFT JOIN chapters ch ON e.chapter_id = ch.id
     WHERE e.is_active = true
     ORDER BY e.created_at DESC`
  );

  return result.rows;
};

// ─────────────────────────────────────────
// GET EXPERIMENTS BY SUBJECT
// ─────────────────────────────────────────
const getExperimentsBySubject = async (subjectId) => {
  const result = await db.query(
    `SELECT
       e.id, e.title, e.description,
       e.experiment_type, e.difficulty,
       e.duration_mins, e.is_active,
       ch.title as chapter_title
     FROM experiments e
     LEFT JOIN chapters ch ON e.chapter_id = ch.id
     WHERE e.subject_id = $1
       AND e.is_active = true
     ORDER BY e.created_at DESC`,
    [subjectId]
  );

  return result.rows;
};

// ─────────────────────────────────────────
// GET EXPERIMENTS BY CHAPTER
// ─────────────────────────────────────────
const getExperimentsByChapter = async (chapterId) => {
  const result = await db.query(
    `SELECT
       e.id, e.title, e.description,
       e.experiment_type, e.difficulty,
       e.duration_mins, e.materials,
       e.procedure, e.expected_results,
       e.safety_notes, e.is_active,
       sim.title as simulation_title,
       sim.sim_type as simulation_type
     FROM experiments e
     LEFT JOIN simulations sim ON e.simulation_id = sim.id
     WHERE e.chapter_id = $1
       AND e.is_active = true
     ORDER BY e.created_at DESC`,
    [chapterId]
  );

  return result.rows;
};

// ─────────────────────────────────────────
// GET SINGLE EXPERIMENT BY ID
// ─────────────────────────────────────────
const getExperimentById = async (experimentId) => {
  const result = await db.query(
    `SELECT
       e.id, e.title, e.description,
       e.experiment_type, e.difficulty,
       e.duration_mins, e.materials,
       e.procedure, e.expected_results,
       e.safety_notes, e.is_active,
       e.created_at,
       s.name as subject_name,
       s.slug as subject_slug,
       ch.title as chapter_title,
       sim.id as simulation_id,
       sim.title as simulation_title,
       sim.sim_type as simulation_type,
       sim.renderer as simulation_renderer,
       sim.config as simulation_config
     FROM experiments e
     LEFT JOIN subjects s ON e.subject_id = s.id
     LEFT JOIN chapters ch ON e.chapter_id = ch.id
     LEFT JOIN simulations sim ON e.simulation_id = sim.id
     WHERE e.id = $1`,
    [experimentId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Experiment not found.', 404);
  }

  return result.rows[0];
};

// ─────────────────────────────────────────
// CREATE EXPERIMENT (admin only)
// ─────────────────────────────────────────
const createExperiment = async (adminId, {
  subject_id,
  chapter_id,
  simulation_id,
  title,
  description,
  experiment_type,
  difficulty,
  duration_mins,
  materials,
  procedure,
  expected_results,
  safety_notes,
}) => {

  const result = await db.query(
    `INSERT INTO experiments (
       subject_id, chapter_id, simulation_id,
       title, description, experiment_type,
       difficulty, duration_mins, materials,
       procedure, expected_results,
       safety_notes, created_by
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING
       id, title, description, experiment_type,
       difficulty, duration_mins, is_active, created_at`,
    [
      subject_id, chapter_id, simulation_id,
      title, description, experiment_type || 'virtual',
      difficulty || 'medium', duration_mins || 30,
      JSON.stringify(materials || []),
      JSON.stringify(procedure || []),
      expected_results, safety_notes, adminId
    ]
  );

  return result.rows[0];
};

// ─────────────────────────────────────────
// UPDATE EXPERIMENT (admin only)
// ─────────────────────────────────────────
const updateExperiment = async (experimentId, {
  title,
  description,
  experiment_type,
  difficulty,
  duration_mins,
  materials,
  procedure,
  expected_results,
  safety_notes,
  is_active,
}) => {

  const result = await db.query(
    `UPDATE experiments
     SET title            = COALESCE($1, title),
         description      = COALESCE($2, description),
         experiment_type  = COALESCE($3, experiment_type),
         difficulty       = COALESCE($4, difficulty),
         duration_mins    = COALESCE($5, duration_mins),
         materials        = COALESCE($6, materials),
         procedure        = COALESCE($7, procedure),
         expected_results = COALESCE($8, expected_results),
         safety_notes     = COALESCE($9, safety_notes),
         is_active        = COALESCE($10, is_active),
         updated_at       = NOW()
     WHERE id = $11
     RETURNING
       id, title, description, experiment_type,
       difficulty, duration_mins, is_active`,
    [
      title, description, experiment_type,
      difficulty, duration_mins,
      materials ? JSON.stringify(materials) : null,
      procedure ? JSON.stringify(procedure) : null,
      expected_results, safety_notes,
      is_active, experimentId
    ]
  );

  if (result.rows.length === 0) {
    throw new AppError('Experiment not found.', 404);
  }

  return result.rows[0];
};

// ─────────────────────────────────────────
// DELETE EXPERIMENT (admin only)
// ─────────────────────────────────────────
const deleteExperiment = async (experimentId) => {
  const result = await db.query(
    'DELETE FROM experiments WHERE id = $1 RETURNING id, title',
    [experimentId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Experiment not found.', 404);
  }

  return { message: `Experiment "${result.rows[0].title}" deleted successfully` };
};

module.exports = {
  getAllExperiments,
  getExperimentsBySubject,
  getExperimentsByChapter,
  getExperimentById,
  createExperiment,
  updateExperiment,
  deleteExperiment,
};