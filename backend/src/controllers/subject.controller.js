const subjectService = require('../services/subject.service');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// ─────────────────────────────────────────
// GET ALL SUBJECTS
// GET /api/v1/subjects
// ─────────────────────────────────────────
const getAllSubjects = asyncHandler(async (req, res) => {
  const subjects = await subjectService.getAllSubjects();
  return success(res, { subjects }, 'Subjects fetched successfully!');
});

// ─────────────────────────────────────────
// GET SINGLE SUBJECT
// GET /api/v1/subjects/:slug
// ─────────────────────────────────────────
const getSubjectBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const subject = await subjectService.getSubjectBySlug(slug);
  return success(res, { subject }, 'Subject fetched successfully!');
});

// ─────────────────────────────────────────
// GET TOPICS FOR A SUBJECT
// GET /api/v1/subjects/:slug/topics
// ─────────────────────────────────────────
const getTopicsBySubject = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const data = await subjectService.getTopicsBySubject(slug);
  return success(res, data, 'Topics fetched successfully!');
});

// ─────────────────────────────────────────
// GET LESSONS FOR A TOPIC
// GET /api/v1/topics/:id/lessons
// ─────────────────────────────────────────
const getLessonsByTopic = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = await subjectService.getLessonsByTopic(id);
  return success(res, data, 'Lessons fetched successfully!');
});

// ─────────────────────────────────────────
// GET CHAPTER WITH CONTENT BLOCKS
// GET /api/v1/chapters/:id
// ─────────────────────────────────────────
const getChapterWithContent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = await subjectService.getChapterWithContent(id);
  return success(res, data, 'Chapter fetched successfully!');
});

// ─────────────────────────────────────────
// CREATE SUBJECT (admin only)
// POST /api/v1/subjects
// ─────────────────────────────────────────
const createSubject = asyncHandler(async (req, res) => {
  const { name, slug, class_level, description } = req.body;
  const subject = await subjectService.createSubject({
    name,
    slug,
    class_level,
    description,
  });
  return success(res, { subject }, 'Subject created successfully!', 201);
});

module.exports = {
  getAllSubjects,
  getSubjectBySlug,
  getTopicsBySubject,
  getLessonsByTopic,
  getChapterWithContent,
  createSubject,
};