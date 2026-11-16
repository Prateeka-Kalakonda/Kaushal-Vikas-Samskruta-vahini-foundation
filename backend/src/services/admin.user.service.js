const db = require('../config/database');
const { AppError } = require('../utils/apiResponse');
const authService = require('./auth.service');

// ─────────────────────────────────────────
// GET ALL ADMINS
// ─────────────────────────────────────────
const getAllAdmins = async () => {
  const result = await db.query(
    `SELECT id, email, username, full_name,
            mobile_no, avatar_url, is_active, created_at
     FROM users
     WHERE role = 'admin'
     ORDER BY created_at DESC`
  );
  return result.rows;
};

// ─────────────────────────────────────────
// GET ALL MENTORS WITH PROFILES
// ─────────────────────────────────────────
const getAllMentors = async () => {
  const result = await db.query(
    `SELECT
       u.id, u.email, u.username, u.full_name,
       u.mobile_no, u.is_active, u.created_at,
       mp.subject, mp.qualification,
       mp.experience, mp.is_verified
     FROM users u
     LEFT JOIN mentor_profiles mp ON u.id = mp.user_id
     WHERE u.role = 'mentor'
     ORDER BY u.created_at DESC`
  );
  return result.rows;
};

// ─────────────────────────────────────────
// GET ALL STUDENTS WITH PROFILES
// ─────────────────────────────────────────
const getAllStudents = async () => {
  const result = await db.query(
    `SELECT
       u.id, u.email, u.username, u.full_name,
       u.mobile_no, u.is_active, u.created_at,
       sp.age, sp.class_level,
       sp.parent_mobile, sp.school_name, sp.board
     FROM users u
     LEFT JOIN student_profiles sp ON u.id = sp.user_id
     WHERE u.role = 'student'
     ORDER BY u.created_at DESC`
  );
  return result.rows;
};

// ─────────────────────────────────────────
// CREATE NEW USER (admin/mentor/student)
// ─────────────────────────────────────────
const createUser = async ({
  email,
  password,
  full_name,
  username,
  mobile_no,
  language,
  role,
}) => {
  // Use auth service register function
  const user = await authService.register({
    email,
    password,
    full_name,
    username,
    mobile_no,
    language,
    role,
  });

  return user;
};

// ─────────────────────────────────────────
// UPDATE ANY USER
// ─────────────────────────────────────────
const updateUser = async (userId, { full_name, username, mobile_no, language, is_active }) => {

  // Check if username is taken by another user
  if (username) {
    const existing = await db.query(
      'SELECT id FROM users WHERE username = $1 AND id != $2',
      [username, userId]
    );
    if (existing.rows.length > 0) {
      throw new AppError('This username is already taken.', 409);
    }
  }

  const result = await db.query(
    `UPDATE users
     SET full_name  = COALESCE($1, full_name),
         username   = COALESCE($2, username),
         mobile_no  = COALESCE($3, mobile_no),
         language   = COALESCE($4, language),
         is_active  = COALESCE($5, is_active),
         updated_at = NOW()
     WHERE id = $6
     RETURNING id, email, username, full_name,
               role, mobile_no, is_active, language`,
    [full_name, username, mobile_no, language, is_active, userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('User not found.', 404);
  }

  return result.rows[0];
};

// ─────────────────────────────────────────
// DEACTIVATE USER (soft delete)
// We never hard delete users
// Just set is_active = false
// ─────────────────────────────────────────
const deactivateUser = async (userId, adminId) => {

  // Admin cannot deactivate themselves
  if (userId === adminId) {
    throw new AppError('You cannot deactivate your own account.', 400);
  }

  const result = await db.query(
    `UPDATE users
     SET is_active = false,
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, email, full_name, role, is_active`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('User not found.', 404);
  }

  return result.rows[0];
};

// ─────────────────────────────────────────
// REACTIVATE USER
// ─────────────────────────────────────────
const reactivateUser = async (userId) => {
  const result = await db.query(
    `UPDATE users
     SET is_active = true,
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, email, full_name, role, is_active`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('User not found.', 404);
  }

  return result.rows[0];
};

// ─────────────────────────────────────────
// ASSIGN MENTOR TO STUDENT
// ─────────────────────────────────────────
const assignMentorToStudent = async (mentorId, studentId, adminId) => {

  // Verify mentor exists and has mentor role
  const mentor = await db.query(
    'SELECT id, role FROM users WHERE id = $1 AND is_active = true',
    [mentorId]
  );

  if (mentor.rows.length === 0 || mentor.rows[0].role !== 'mentor') {
    throw new AppError('Mentor not found.', 404);
  }

  // Verify student exists and has student role
  const student = await db.query(
    'SELECT id, role FROM users WHERE id = $1 AND is_active = true',
    [studentId]
  );

  if (student.rows.length === 0 || student.rows[0].role !== 'student') {
    throw new AppError('Student not found.', 404);
  }

  // Check if already assigned
  const existing = await db.query(
    'SELECT id FROM mentor_student_assignments WHERE mentor_id = $1 AND student_id = $2',
    [mentorId, studentId]
  );

  if (existing.rows.length > 0) {
    throw new AppError('This student is already assigned to this mentor.', 409);
  }

  const result = await db.query(
    `INSERT INTO mentor_student_assignments
      (mentor_id, student_id, assigned_by)
     VALUES ($1, $2, $3)
     RETURNING id, mentor_id, student_id, assigned_at`,
    [mentorId, studentId, adminId]
  );

  return result.rows[0];
};

// ─────────────────────────────────────────
// UNASSIGN MENTOR FROM STUDENT
// ─────────────────────────────────────────
const unassignMentorFromStudent = async (mentorId, studentId) => {
  const result = await db.query(
    `DELETE FROM mentor_student_assignments
     WHERE mentor_id = $1 AND student_id = $2
     RETURNING id`,
    [mentorId, studentId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Assignment not found.', 404);
  }

  return { message: 'Student unassigned from mentor successfully' };
};

// ─────────────────────────────────────────
// GET STUDENTS ASSIGNED TO A MENTOR
// ─────────────────────────────────────────
const getMentorStudents = async (mentorId) => {
  const result = await db.query(
    `SELECT
       u.id, u.email, u.username, u.full_name,
       u.mobile_no, u.created_at,
       sp.age, sp.class_level, sp.school_name,
       msa.assigned_at
     FROM mentor_student_assignments msa
     JOIN users u ON msa.student_id = u.id
     LEFT JOIN student_profiles sp ON u.id = sp.user_id
     WHERE msa.mentor_id = $1
       AND u.is_active = true
     ORDER BY msa.assigned_at DESC`,
    [mentorId]
  );

  return result.rows;
};

// ─────────────────────────────────────────
// GET MENTOR ASSIGNED TO A STUDENT
// ─────────────────────────────────────────
const getStudentMentor = async (studentId) => {
  const result = await db.query(
    `SELECT
       u.id, u.email, u.username, u.full_name,
       mp.subject, mp.qualification,
       mp.experience, mp.is_verified,
       msa.assigned_at
     FROM mentor_student_assignments msa
     JOIN users u ON msa.mentor_id = u.id
     LEFT JOIN mentor_profiles mp ON u.id = mp.user_id
     WHERE msa.student_id = $1
       AND u.is_active = true`,
    [studentId]
  );

  return result.rows[0] || null;
};

// ─────────────────────────────────────────
// ADMIN: UPDATE STUDENT PROFILE FOR ANY USER
// ─────────────────────────────────────────
const updateStudentProfileAsAdmin = async (userId, { age, class_level, parent_mobile, school_name, board }) => {
  const userCheck = await db.query('SELECT role FROM users WHERE id = $1', [userId]);
  if (userCheck.rows.length === 0) {
    throw new AppError('User not found.', 404);
  }
  if (userCheck.rows[0].role !== 'student') {
    throw new AppError('This user is not a student.', 400);
  }

  const result = await db.query(
    `INSERT INTO student_profiles
      (user_id, age, class_level, parent_mobile, school_name, board)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (user_id)
     DO UPDATE SET
       age           = COALESCE(EXCLUDED.age, student_profiles.age),
       class_level   = COALESCE(EXCLUDED.class_level, student_profiles.class_level),
       parent_mobile = COALESCE(EXCLUDED.parent_mobile, student_profiles.parent_mobile),
       school_name   = COALESCE(EXCLUDED.school_name, student_profiles.school_name),
       board         = COALESCE(EXCLUDED.board, student_profiles.board),
       updated_at    = NOW()
     RETURNING id, age, class_level, parent_mobile, school_name, board`,
    [userId, age, class_level, parent_mobile, school_name, board]
  );

  return result.rows[0];
};

// ─────────────────────────────────────────
// ADMIN: UPDATE MENTOR PROFILE FOR ANY USER
// ─────────────────────────────────────────
const updateMentorProfileAsAdmin = async (userId, { subject, qualification, experience, bio }) => {
  const userCheck = await db.query('SELECT role FROM users WHERE id = $1', [userId]);
  if (userCheck.rows.length === 0) {
    throw new AppError('User not found.', 404);
  }
  if (userCheck.rows[0].role !== 'mentor') {
    throw new AppError('This user is not a mentor.', 400);
  }

  const result = await db.query(
    `INSERT INTO mentor_profiles
      (user_id, subject, qualification, experience, bio)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id)
     DO UPDATE SET
       subject       = COALESCE(EXCLUDED.subject, mentor_profiles.subject),
       qualification = COALESCE(EXCLUDED.qualification, mentor_profiles.qualification),
       experience    = COALESCE(EXCLUDED.experience, mentor_profiles.experience),
       bio           = COALESCE(EXCLUDED.bio, mentor_profiles.bio),
       updated_at    = NOW()
     RETURNING id, subject, qualification, experience, bio, is_verified`,
    [userId, subject, qualification, experience, bio]
  );

  return result.rows[0];
};

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

