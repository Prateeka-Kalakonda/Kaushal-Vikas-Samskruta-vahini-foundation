const adminUserService = require('../services/admin.user.service');
const { success } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// ─────────────────────────────────────────
// GET ALL ADMINS
// GET /api/v1/admin/users/admins
// ─────────────────────────────────────────
const getAllAdmins = asyncHandler(async (req, res) => {
  const admins = await adminUserService.getAllAdmins();
  return success(res, { admins }, 'Admins fetched successfully!');
});

// ─────────────────────────────────────────
// GET ALL MENTORS
// GET /api/v1/admin/users/mentors
// ─────────────────────────────────────────
const getAllMentors = asyncHandler(async (req, res) => {
  const mentors = await adminUserService.getAllMentors();
  return success(res, { mentors }, 'Mentors fetched successfully!');
});

// ─────────────────────────────────────────
// GET ALL STUDENTS
// GET /api/v1/admin/users/students
// ─────────────────────────────────────────
const getAllStudents = asyncHandler(async (req, res) => {
  const students = await adminUserService.getAllStudents();
  return success(res, { students }, 'Students fetched successfully!');
});

// ─────────────────────────────────────────
// CREATE NEW USER
// POST /api/v1/admin/users
// ─────────────────────────────────────────
const createUser = asyncHandler(async (req, res) => {
  const {
    email,
    password,
    full_name,
    username,
    mobile_no,
    language,
    role,
  } = req.body;

  const user = await adminUserService.createUser({
    email,
    password,
    full_name,
    username,
    mobile_no,
    language,
    role,
  });

  return success(res, { user }, `${role} account created successfully!`, 201);
});

// ─────────────────────────────────────────
// UPDATE ANY USER
// PUT /api/v1/admin/users/:id
// ─────────────────────────────────────────
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { full_name, username, mobile_no, language, is_active } = req.body;

  const user = await adminUserService.updateUser(id, {
    full_name,
    username,
    mobile_no,
    language,
    is_active,
  });

  return success(res, { user }, 'User updated successfully!');
});

// ─────────────────────────────────────────
// DEACTIVATE USER
// DELETE /api/v1/admin/users/:id
// ─────────────────────────────────────────
const deactivateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await adminUserService.deactivateUser(id, req.user.id);
  return success(res, { user }, 'User deactivated successfully!');
});

// ─────────────────────────────────────────
// REACTIVATE USER
// PUT /api/v1/admin/users/:id/activate
// ─────────────────────────────────────────
const reactivateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await adminUserService.reactivateUser(id);
  return success(res, { user }, 'User reactivated successfully!');
});

// ─────────────────────────────────────────
// ASSIGN MENTOR TO STUDENT
// POST /api/v1/admin/users/assign-mentor
// ─────────────────────────────────────────
const assignMentorToStudent = asyncHandler(async (req, res) => {
  const { mentor_id, student_id } = req.body;

  const assignment = await adminUserService.assignMentorToStudent(
    mentor_id,
    student_id,
    req.user.id
  );

  return success(res, { assignment }, 'Mentor assigned to student successfully!');
});

// ─────────────────────────────────────────
// UNASSIGN MENTOR FROM STUDENT
// DELETE /api/v1/admin/users/unassign-mentor
// ─────────────────────────────────────────
const unassignMentorFromStudent = asyncHandler(async (req, res) => {
  const { mentor_id, student_id } = req.body;

  const result = await adminUserService.unassignMentorFromStudent(
    mentor_id,
    student_id
  );

  return success(res, result, 'Mentor unassigned successfully!');
});

// ─────────────────────────────────────────
// GET STUDENTS ASSIGNED TO A MENTOR
// GET /api/v1/admin/users/mentors/:mentorId/students
// ─────────────────────────────────────────
const getMentorStudents = asyncHandler(async (req, res) => {
  const { mentorId } = req.params;
  const students = await adminUserService.getMentorStudents(mentorId);
  return success(res, { students }, 'Mentor students fetched successfully!');
});

// ─────────────────────────────────────────
// GET MENTOR ASSIGNED TO A STUDENT
// GET /api/v1/admin/users/students/:studentId/mentor
// ─────────────────────────────────────────
const getStudentMentor = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const mentor = await adminUserService.getStudentMentor(studentId);
  return success(res, { mentor }, 'Student mentor fetched successfully!');
});

const updateStudentProfileAsAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { age, class_level, parent_mobile, school_name, board } = req.body;
  const profile = await adminUserService.updateStudentProfileAsAdmin(id, {
    age, class_level, parent_mobile, school_name, board,
  });
  return success(res, { profile }, 'Student profile updated successfully!');
});

const updateMentorProfileAsAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { subject, qualification, experience, bio } = req.body;
  const profile = await adminUserService.updateMentorProfileAsAdmin(id, {
    subject, qualification, experience, bio,
  });
  return success(res, { profile }, 'Mentor profile updated successfully!');
});

module.exports = {
  getAllAdmins,
  getAllMentors,
  getAllStudents,
  createUser,
  updateUser,
  deactivateUser,
  reactivateUser,
  assignMentorToStudent,
  unassignMentorFromStudent,
  getMentorStudents,
  getStudentMentor,
  updateStudentProfileAsAdmin,
  updateMentorProfileAsAdmin,
};

