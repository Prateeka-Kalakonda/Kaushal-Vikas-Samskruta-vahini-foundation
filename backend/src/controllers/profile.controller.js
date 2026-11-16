const profileService = require('../services/profile.service');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// ─────────────────────────────────────────
// GET MY FULL PROFILE
// GET /api/v1/profile
// Works for all roles
// ─────────────────────────────────────────
const getProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.getProfile(req.user.id);
  return success(res, { profile }, 'Profile fetched successfully!');
});

// ─────────────────────────────────────────
// UPDATE COMMON PROFILE
// PUT /api/v1/profile
// Works for all roles
// ─────────────────────────────────────────
const updateProfile = asyncHandler(async (req, res) => {
  const { full_name, username, mobile_no, language } = req.body;

  const profile = await profileService.updateProfile(req.user.id, {
    full_name,
    username,
    mobile_no,
    language,
  });

  return success(res, { profile }, 'Profile updated successfully!');
});

// ─────────────────────────────────────────
// CHANGE PASSWORD
// PUT /api/v1/profile/password
// Works for all roles
// ─────────────────────────────────────────
const changePassword = asyncHandler(async (req, res) => {
  const { current_password, new_password } = req.body;

  const result = await profileService.changePassword(req.user.id, {
    current_password,
    new_password,
  });

  return success(res, result, 'Password changed successfully!');
});

// ─────────────────────────────────────────
// UPDATE STUDENT PROFILE
// PUT /api/v1/profile/student
// Only for student role
// ─────────────────────────────────────────
const updateStudentProfile = asyncHandler(async (req, res) => {
  const { age, class_level, parent_mobile, school_name, board } = req.body;

  const profile = await profileService.updateStudentProfile(req.user.id, {
    age,
    class_level,
    parent_mobile,
    school_name,
    board,
  });

  return success(res, { profile }, 'Student profile updated successfully!');
});

// ─────────────────────────────────────────
// UPDATE MENTOR PROFILE
// PUT /api/v1/profile/mentor
// Only for mentor role
// ─────────────────────────────────────────
const updateMentorProfile = asyncHandler(async (req, res) => {
  const { subject, qualification, experience, bio } = req.body;

  const profile = await profileService.updateMentorProfile(req.user.id, {
    subject,
    qualification,
    experience,
    bio,
  });

  return success(res, { profile }, 'Mentor profile updated successfully!');
});

// ─────────────────────────────────────────
// GET ALL USERS (admin only)
// GET /api/v1/profile/users
// ─────────────────────────────────────────
const getAllUsers = asyncHandler(async (req, res) => {
  // Optional filter by role
  // Example: /api/v1/profile/users?role=student
  const { role } = req.query;
  const users = await profileService.getAllUsers(role || null);
  return success(res, { users }, 'Users fetched successfully!');
});

// ─────────────────────────────────────────
// GET ANY USER BY ID (admin only)
// GET /api/v1/profile/users/:id
// ─────────────────────────────────────────
const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await profileService.getUserById(id);
  return success(res, { user }, 'User fetched successfully!');
});

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  updateStudentProfile,
  updateMentorProfile,
  getAllUsers,
  getUserById,
};