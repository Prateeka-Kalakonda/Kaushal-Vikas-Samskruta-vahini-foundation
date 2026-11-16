const mentorService = require('../services/mentor.service');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// ─────────────────────────────────────────
// GET ALL MENTORS
// GET /api/v1/mentors
// Public route
// ─────────────────────────────────────────
const getAllMentors = asyncHandler(async (req, res) => {
  const mentors = await mentorService.getAllMentors();
  return success(res, { mentors }, 'Mentors fetched successfully!');
});

// ─────────────────────────────────────────
// GET SINGLE MENTOR BY ID
// GET /api/v1/mentors/:id
// Public route
// ─────────────────────────────────────────
const getMentorById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const mentor = await mentorService.getMentorById(id);
  return success(res, { mentor }, 'Mentor fetched successfully!');
});

// ─────────────────────────────────────────
// GET MENTORS BY SUBJECT
// GET /api/v1/mentors/subject/:subject
// Public route
// Example: /api/v1/mentors/subject/Physics
// ─────────────────────────────────────────
const getMentorsBySubject = asyncHandler(async (req, res) => {
  const { subject } = req.params;
  const mentors = await mentorService.getMentorsBySubject(subject);
  return success(res, { mentors }, `${subject} mentors fetched successfully!`);
});

// ─────────────────────────────────────────
// CREATE MENTOR PROFILE
// POST /api/v1/mentors/profile
// Mentor only route
// ─────────────────────────────────────────
const createMentorProfile = asyncHandler(async (req, res) => {
  const { subject, qualification, experience, bio } = req.body;

  const profile = await mentorService.createMentorProfile(req.user.id, {
    subject,
    qualification,
    experience,
    bio,
  });

  return success(res, { profile }, 'Mentor profile created successfully!', 201);
});

// ─────────────────────────────────────────
// VERIFY MENTOR
// PUT /api/v1/mentors/:id/verify
// Admin only route
// ─────────────────────────────────────────
const verifyMentor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await mentorService.verifyMentor(id);
  return success(res, { result }, 'Mentor verified successfully!');
});

// ─────────────────────────────────────────
// UNVERIFY MENTOR
// PUT /api/v1/mentors/:id/unverify
// Admin only route
// ─────────────────────────────────────────
const unverifyMentor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await mentorService.unverifyMentor(id);
  return success(res, { result }, 'Mentor unverified successfully!');
});

// ─────────────────────────────────────────
// ASSIGN MENTOR ROLE TO USER
// PUT /api/v1/mentors/assign/:userId
// Admin only route
// ─────────────────────────────────────────
const assignMentorRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await mentorService.assignMentorRole(userId);
  return success(res, { user }, 'Mentor role assigned successfully!');
});

// ─────────────────────────────────────────
// GET MENTOR STATS
// GET /api/v1/mentors/stats
// Admin only route
// ─────────────────────────────────────────
const getMentorStats = asyncHandler(async (req, res) => {
  const stats = await mentorService.getMentorStats();
  return success(res, { stats }, 'Mentor stats fetched successfully!');
});

// ─────────────────────────────────────────
// GET MY STUDENTS (mentor's own students)
// GET /api/v1/mentors/my-students
// ─────────────────────────────────────────
const getMyStudents = asyncHandler(async (req, res) => {
  const students = await mentorService.getMyStudents(req.user.id);
  return success(res, { students }, 'Your students fetched successfully!');
});

// ─────────────────────────────────────────
// GET DETAILED PROGRESS OF ONE STUDENT
// GET /api/v1/mentors/my-students/:studentId/progress
// ─────────────────────────────────────────
const getStudentProgressForMentor = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const progress = await mentorService.getStudentProgressForMentor(
    req.user.id,
    studentId
  );
  return success(res, { progress }, 'Student progress fetched successfully!');
});

// ─────────────────────────────────────────
// GET MENTOR PERFORMANCE OVERVIEW (admin only)
// GET /api/v1/mentors/performance
// ─────────────────────────────────────────
const getMentorPerformanceOverview = asyncHandler(async (req, res) => {
  const mentors = await mentorService.getMentorPerformanceOverview();
  return success(res, { mentors }, 'Mentor performance fetched successfully!');
});

// ─────────────────────────────────────────
// GET ONE MENTOR DETAILED PERFORMANCE (admin only)
// GET /api/v1/mentors/performance/:mentorId
// ─────────────────────────────────────────
const getMentorPerformanceDetail = asyncHandler(async (req, res) => {
  const { mentorId } = req.params;
  const performance = await mentorService.getMentorPerformanceDetail(mentorId);
  return success(res, { performance }, 'Mentor performance detail fetched successfully!');
});

module.exports = {
  getAllMentors,
  getMentorById,
  getMentorsBySubject,
  createMentorProfile,
  verifyMentor,
  unverifyMentor,
  assignMentorRole,
  getMentorStats,
  getMyStudents,
  getStudentProgressForMentor,
  getMentorPerformanceOverview,
  getMentorPerformanceDetail,
};