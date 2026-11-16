const progressService = require('../services/progress.service');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// ─────────────────────────────────────────
// UPDATE READING PROGRESS
// POST /api/v1/progress
// ─────────────────────────────────────────
const updateProgress = asyncHandler(async (req, res) => {
  const { chapter_id, last_block_id, progress_pct } = req.body;
  const progress = await progressService.updateProgress(req.user.id, {
    chapter_id,
    last_block_id,
    progress_pct,
  });
  return success(res, { progress }, 'Progress updated successfully!');
});

// ─────────────────────────────────────────
// GET CONTINUE READING
// GET /api/v1/progress/continue-reading
// ─────────────────────────────────────────
const getContinueReading = asyncHandler(async (req, res) => {
  const chapters = await progressService.getContinueReading(req.user.id);
  return success(res, { chapters }, 'Continue reading fetched successfully!');
});

// ─────────────────────────────────────────
// GET PROGRESS FOR A SPECIFIC CHAPTER
// GET /api/v1/progress/chapter/:chapterId
// ─────────────────────────────────────────
const getChapterProgress = asyncHandler(async (req, res) => {
  const { chapterId } = req.params;
  const progress = await progressService.getChapterProgress(
    req.user.id,
    chapterId
  );
  return success(res, { progress }, 'Chapter progress fetched successfully!');
});

// ─────────────────────────────────────────
// GET ALL COMPLETED CHAPTERS
// GET /api/v1/progress/completed
// ─────────────────────────────────────────
const getCompletedChapters = asyncHandler(async (req, res) => {
  const chapters = await progressService.getCompletedChapters(req.user.id);
  return success(res, { chapters }, 'Completed chapters fetched successfully!');
});

// ─────────────────────────────────────────
// GET CURRICULUM MASTERY
// GET /api/v1/progress/mastery
// ─────────────────────────────────────────
const getCurriculumMastery = asyncHandler(async (req, res) => {
  const mastery = await progressService.getCurriculumMastery(req.user.id);
  return success(res, { mastery }, 'Curriculum mastery fetched successfully!');
});

module.exports = {
  updateProgress,
  getContinueReading,
  getChapterProgress,
  getCompletedChapters,
  getCurriculumMastery,
};