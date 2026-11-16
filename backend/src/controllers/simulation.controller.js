const simulationService = require('../services/simulation.service');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// ─────────────────────────────────────────
// GET ALL SIMULATIONS
// GET /api/v1/simulations
// Returns total_count + latest first
// ─────────────────────────────────────────
const getAllSimulations = asyncHandler(async (req, res) => {
  const data = await simulationService.getAllSimulations();
  return success(res, data, 'Simulations fetched successfully!');
});

// ─────────────────────────────────────────
// GET SIMULATIONS BY CHAPTER
// GET /api/v1/simulations/chapter/:chapterId
// ─────────────────────────────────────────
const getSimulationsByChapter = asyncHandler(async (req, res) => {
  const { chapterId } = req.params;
  const simulations = await simulationService.getSimulationsByChapter(chapterId);
  return success(res, { simulations }, 'Simulations fetched successfully!');
});

// ─────────────────────────────────────────
// GET SIMULATIONS BY TOPIC
// GET /api/v1/simulations/topic/:topicId
// For Experiments page - segregated by topic
// ─────────────────────────────────────────
const getSimulationsByTopic = asyncHandler(async (req, res) => {
  const { topicId } = req.params;
  const data = await simulationService.getSimulationsByTopic(topicId);
  return success(res, data, 'Topic simulations fetched successfully!');
});

// ─────────────────────────────────────────
// GET TOPICS WITH SIMULATION COUNTS
// GET /api/v1/simulations/topics/counts
// GET /api/v1/simulations/topics/counts?subject=physics
// Shows "Mechanics (3)", "Electricity (2)" etc
// ─────────────────────────────────────────
const getTopicsWithSimulationCounts = asyncHandler(async (req, res) => {
  const { subject } = req.query;
  const topics = await simulationService.getTopicsWithSimulationCounts(
    subject || null
  );
  return success(res, { topics }, 'Topics with counts fetched successfully!');
});

// ─────────────────────────────────────────
// GET SUBJECTS WITH CATEGORIES
// GET /api/v1/simulations/categories
// For Science/Tech/Engineering/Arts/Maths dropdown
// ─────────────────────────────────────────
const getSubjectsWithCategories = asyncHandler(async (req, res) => {
  const categories = await simulationService.getSubjectsWithCategories();
  return success(res, { categories }, 'Categories fetched successfully!');
});

// ─────────────────────────────────────────
// GET SINGLE SIMULATION WITH FULL PAGE CONTENT
// GET /api/v1/simulations/:id
// ─────────────────────────────────────────
const getSimulationById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const simulation = await simulationService.getSimulationById(id);
  return success(res, { simulation }, 'Simulation fetched successfully!');
});

// ─────────────────────────────────────────
// CREATE SIMULATION (admin only)
// POST /api/v1/simulations
// ─────────────────────────────────────────
const createSimulation = asyncHandler(async (req, res) => {
  const {
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
  } = req.body;

  const simulation = await simulationService.createSimulation({
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
  });

  return success(res, { simulation }, 'Simulation created successfully!', 201);
});

// ─────────────────────────────────────────
// SAVE SIMULATION SESSION
// POST /api/v1/simulations/:id/session
// ─────────────────────────────────────────
const saveSimulationSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { session_data, duration_sec } = req.body;

  const session = await simulationService.saveSimulationSession(
    req.user.id,
    id,
    session_data,
    duration_sec
  );

  return success(res, { session }, 'Session saved successfully!');
});

// ─────────────────────────────────────────
// GET SIMULATION HISTORY FOR STUDENT
// GET /api/v1/simulations/history
// ─────────────────────────────────────────
const getSimulationHistory = asyncHandler(async (req, res) => {
  const history = await simulationService.getSimulationHistory(req.user.id);
  return success(res, { history }, 'Simulation history fetched successfully!');
});

// ─────────────────────────────────────────
// GET SIMULATION NOTES
// GET /api/v1/simulations/:id/notes
// ─────────────────────────────────────────
const getSimulationNotes = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const notes = await simulationService.getSimulationNotes(id);
  return success(res, { notes }, 'Simulation notes fetched successfully!');
});

// ─────────────────────────────────────────
// ADD SIMULATION NOTE (admin only)
// POST /api/v1/simulations/:id/notes
// ─────────────────────────────────────────
const addSimulationNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, content, note_type, order_index } = req.body;

  const note = await simulationService.addSimulationNote(
    req.user.id,
    id,
    { title, content, note_type, order_index }
  );

  return success(res, { note }, 'Simulation note added successfully!', 201);
});

// ─────────────────────────────────────────
// UPDATE SIMULATION NOTE (admin only)
// PUT /api/v1/simulations/notes/:noteId
// ─────────────────────────────────────────
const updateSimulationNote = asyncHandler(async (req, res) => {
  const { noteId } = req.params;
  const { title, content, note_type, order_index } = req.body;

  const note = await simulationService.updateSimulationNote(noteId, {
    title, content, note_type, order_index,
  });

  return success(res, { note }, 'Simulation note updated successfully!');
});

// ─────────────────────────────────────────
// DELETE SIMULATION NOTE (admin only)
// DELETE /api/v1/simulations/notes/:noteId
// ─────────────────────────────────────────
const deleteSimulationNote = asyncHandler(async (req, res) => {
  const { noteId } = req.params;
  const result = await simulationService.deleteSimulationNote(noteId);
  return success(res, result, 'Simulation note deleted successfully!');
});

// ─────────────────────────────────────────
// ADD SIMULATION PAGE SECTION (admin only)
// POST /api/v1/simulations/:id/pages
// ─────────────────────────────────────────
const addSimulationPage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { section_type, title, content, latex, order_index } = req.body;

  const page = await simulationService.addSimulationPage(
    req.user.id,
    id,
    { section_type, title, content, latex, order_index }
  );

  return success(res, { page }, 'Page section added successfully!', 201);
});

// ─────────────────────────────────────────
// UPDATE SIMULATION PAGE SECTION (admin only)
// PUT /api/v1/simulations/pages/:pageId
// ─────────────────────────────────────────
const updateSimulationPage = asyncHandler(async (req, res) => {
  const { pageId } = req.params;
  const { title, content, latex, order_index } = req.body;

  const page = await simulationService.updateSimulationPage(pageId, {
    title, content, latex, order_index,
  });

  return success(res, { page }, 'Page section updated successfully!');
});

// ─────────────────────────────────────────
// DELETE SIMULATION PAGE SECTION (admin only)
// DELETE /api/v1/simulations/pages/:pageId
// ─────────────────────────────────────────
const deleteSimulationPage = asyncHandler(async (req, res) => {
  const { pageId } = req.params;
  const result = await simulationService.deleteSimulationPage(pageId);
  return success(res, result, 'Page section deleted successfully!');
});

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