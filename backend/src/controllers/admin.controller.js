const adminService = require('../services/admin.service');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// ─────────────────────────────────────────
// DASHBOARD STATS
// GET /api/v1/admin/dashboard
// ─────────────────────────────────────────
const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getDashboardStats();
  return success(res, { stats }, 'Dashboard stats fetched successfully!');
});

// ─────────────────────────────────────────
// SUBJECT MANAGEMENT
// ─────────────────────────────────────────
const updateSubject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, icon_url, is_active } = req.body;
  const subject = await adminService.updateSubject(id, {
    name,
    description,
    icon_url,
    is_active,
  });
  return success(res, { subject }, 'Subject updated successfully!');
});

const deleteSubject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await adminService.deleteSubject(id);
  return success(res, result, 'Subject deleted successfully!');
});

// ─────────────────────────────────────────
// TOPIC MANAGEMENT
// ─────────────────────────────────────────
const createTopic = asyncHandler(async (req, res) => {
  const { subject_id, name, slug, order_index } = req.body;
  const topic = await adminService.createTopic({
    subject_id,
    name,
    slug,
    order_index,
  });
  return success(res, { topic }, 'Topic created successfully!', 201);
});

const updateTopic = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, slug, order_index } = req.body;
  const topic = await adminService.updateTopic(id, {
    name,
    slug,
    order_index,
  });
  return success(res, { topic }, 'Topic updated successfully!');
});

const deleteTopic = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await adminService.deleteTopic(id);
  return success(res, result, 'Topic deleted successfully!');
});

// ─────────────────────────────────────────
// CHAPTER MANAGEMENT
// ─────────────────────────────────────────
const createChapter = asyncHandler(async (req, res) => {
  const { lesson_id, title, chapter_num, ncert_ref, order_index } = req.body;
  const chapter = await adminService.createChapter({
    lesson_id,
    title,
    chapter_num,
    ncert_ref,
    order_index,
  });
  return success(res, { chapter }, 'Chapter created successfully!', 201);
});

const updateChapter = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, chapter_num, ncert_ref, order_index } = req.body;
  const chapter = await adminService.updateChapter(id, {
    title,
    chapter_num,
    ncert_ref,
    order_index,
  });
  return success(res, { chapter }, 'Chapter updated successfully!');
});

const deleteChapter = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await adminService.deleteChapter(id);
  return success(res, result, 'Chapter deleted successfully!');
});

// ─────────────────────────────────────────
// CONTENT BLOCK MANAGEMENT
// ─────────────────────────────────────────
const createContentBlock = asyncHandler(async (req, res) => {
  const {
    chapter_id,
    block_type,
    title,
    content,
    order_index,
    language,
  } = req.body;
  const block = await adminService.createContentBlock({
    chapter_id,
    block_type,
    title,
    content,
    order_index,
    language,
  });
  return success(res, { block }, 'Content block created successfully!', 201);
});

const updateContentBlock = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, content, order_index } = req.body;
  const block = await adminService.updateContentBlock(id, {
    title,
    content,
    order_index,
  });
  return success(res, { block }, 'Content block updated successfully!');
});

const deleteContentBlock = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await adminService.deleteContentBlock(id);
  return success(res, result, 'Content block deleted successfully!');
});

module.exports = {
  getDashboardStats,
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
};