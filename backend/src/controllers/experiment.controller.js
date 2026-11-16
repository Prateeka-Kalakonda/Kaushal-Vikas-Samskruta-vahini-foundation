const experimentService = require('../services/experiment.service');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// ─────────────────────────────────────────
// GET ALL EXPERIMENTS
// GET /api/v1/experiments
// Public route
// ─────────────────────────────────────────
const getAllExperiments = asyncHandler(async (req, res) => {
  const experiments = await experimentService.getAllExperiments();
  return success(res, { experiments }, 'Experiments fetched successfully!');
});

// ─────────────────────────────────────────
// GET EXPERIMENTS BY SUBJECT
// GET /api/v1/experiments/subject/:subjectId
// Public route
// ─────────────────────────────────────────
const getExperimentsBySubject = asyncHandler(async (req, res) => {
  const { subjectId } = req.params;
  const experiments = await experimentService.getExperimentsBySubject(subjectId);
  return success(res, { experiments }, 'Subject experiments fetched successfully!');
});

// ─────────────────────────────────────────
// GET EXPERIMENTS BY CHAPTER
// GET /api/v1/experiments/chapter/:chapterId
// Public route
// ─────────────────────────────────────────
const getExperimentsByChapter = asyncHandler(async (req, res) => {
  const { chapterId } = req.params;
  const experiments = await experimentService.getExperimentsByChapter(chapterId);
  return success(res, { experiments }, 'Chapter experiments fetched successfully!');
});

// ─────────────────────────────────────────
// GET SINGLE EXPERIMENT
// GET /api/v1/experiments/:id
// Public route
// ─────────────────────────────────────────
const getExperimentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const experiment = await experimentService.getExperimentById(id);
  return success(res, { experiment }, 'Experiment fetched successfully!');
});

// ─────────────────────────────────────────
// CREATE EXPERIMENT
// POST /api/v1/experiments
// Admin only
// ─────────────────────────────────────────
const createExperiment = asyncHandler(async (req, res) => {
  const {
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
  } = req.body;

  const experiment = await experimentService.createExperiment(req.user.id, {
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
  });

  return success(res, { experiment }, 'Experiment created successfully!', 201);
});

// ─────────────────────────────────────────
// UPDATE EXPERIMENT
// PUT /api/v1/experiments/:id
// Admin only
// ─────────────────────────────────────────
const updateExperiment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
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
  } = req.body;

  const experiment = await experimentService.updateExperiment(id, {
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
  });

  return success(res, { experiment }, 'Experiment updated successfully!');
});

// ─────────────────────────────────────────
// DELETE EXPERIMENT
// DELETE /api/v1/experiments/:id
// Admin only
// ─────────────────────────────────────────
const deleteExperiment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await experimentService.deleteExperiment(id);
  return success(res, result, 'Experiment deleted successfully!');
});

module.exports = {
  getAllExperiments,
  getExperimentsBySubject,
  getExperimentsByChapter,
  getExperimentById,
  createExperiment,
  updateExperiment,
  deleteExperiment,
};