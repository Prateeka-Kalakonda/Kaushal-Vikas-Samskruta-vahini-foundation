const db = require('../config/database');
const { AppError } = require('../utils/apiResponse');
const bcrypt = require('bcryptjs');

// ─────────────────────────────────────────
// GET FULL PROFILE
// Returns user + student/mentor extra details
// ─────────────────────────────────────────
const getProfile = async (userId) => {

  // Get base user details
  const userResult = await db.query(
    `SELECT id, email, username, full_name, role,
            language, mobile_no, avatar_url, created_at
     FROM users
     WHERE id = $1 AND is_active = true`,
    [userId]
  );

  if (userResult.rows.length === 0) {
    throw new AppError('User not found.', 404);
  }

  const user = userResult.rows[0];

  // Get extra details based on role
  if (user.role === 'student') {
    const studentResult = await db.query(
      `SELECT age, class_level, parent_mobile, school_name, board
       FROM student_profiles
       WHERE user_id = $1`,
      [userId]
    );
    user.student_profile = studentResult.rows[0] || null;
  }

  if (user.role === 'mentor') {
    const mentorResult = await db.query(
      `SELECT subject, qualification, experience, bio, is_verified
       FROM mentor_profiles
       WHERE user_id = $1`,
      [userId]
    );
    user.mentor_profile = mentorResult.rows[0] || null;
  }

  return user;
};

// ─────────────────────────────────────────
// UPDATE COMMON PROFILE
// Works for all roles (student, admin, mentor)
// ─────────────────────────────────────────
const updateProfile = async (userId, { full_name, username, mobile_no, language }) => {

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
         updated_at = NOW()
     WHERE id = $5
     RETURNING id, email, username, full_name, role,
               language, mobile_no, avatar_url`,
    [full_name, username, mobile_no, language, userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('User not found.', 404);
  }

  return result.rows[0];
};

// ─────────────────────────────────────────
// CHANGE PASSWORD
// Works for all roles
// ─────────────────────────────────────────
const changePassword = async (userId, { current_password, new_password }) => {

  // Get current hashed password from database
  const result = await db.query(
    'SELECT password FROM users WHERE id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('User not found.', 404);
  }

  // Verify current password is correct
  const isCurrentPasswordValid = await bcrypt.compare(
    current_password,
    result.rows[0].password
  );

  if (!isCurrentPasswordValid) {
    throw new AppError('Current password is incorrect.', 401);
  }

  // Check new password is different from current
  const isSamePassword = await bcrypt.compare(
    new_password,
    result.rows[0].password
  );

  if (isSamePassword) {
    throw new AppError('New password must be different from current password.', 400);
  }

  // Hash the new password
  const hashedNewPassword = await bcrypt.hash(
    new_password,
    parseInt(process.env.BCRYPT_ROUNDS)
  );

  // Update password in database
  await db.query(
    'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
    [hashedNewPassword, userId]
  );

  return { message: 'Password changed successfully' };
};

// ─────────────────────────────────────────
// UPDATE STUDENT PROFILE
// Only for student role
// ─────────────────────────────────────────
const updateStudentProfile = async (userId, { age, class_level, parent_mobile, school_name, board }) => {

  // Make sure user is a student
  const userResult = await db.query(
    'SELECT role FROM users WHERE id = $1',
    [userId]
  );

  if (userResult.rows[0].role !== 'student') {
    throw new AppError('Only students can update student profile.', 403);
  }

  // Insert or update student profile
  const result = await db.query(
    `INSERT INTO student_profiles
      (user_id, age, class_level, parent_mobile, school_name, board)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (user_id)
     DO UPDATE SET
       age          = COALESCE(EXCLUDED.age, student_profiles.age),
       class_level  = COALESCE(EXCLUDED.class_level, student_profiles.class_level),
       parent_mobile= COALESCE(EXCLUDED.parent_mobile, student_profiles.parent_mobile),
       school_name  = COALESCE(EXCLUDED.school_name, student_profiles.school_name),
       board        = COALESCE(EXCLUDED.board, student_profiles.board),
       updated_at   = NOW()
     RETURNING id, age, class_level, parent_mobile, school_name, board`,
    [userId, age, class_level, parent_mobile, school_name, board]
  );

  return result.rows[0];
};

// ─────────────────────────────────────────
// UPDATE MENTOR PROFILE
// Only for mentor role
// ─────────────────────────────────────────
const updateMentorProfile = async (userId, { subject, qualification, experience, bio }) => {

  // Make sure user is a mentor
  const userResult = await db.query(
    'SELECT role FROM users WHERE id = $1',
    [userId]
  );

  if (userResult.rows[0].role !== 'mentor') {
    throw new AppError('Only mentors can update mentor profile.', 403);
  }

  // Insert or update mentor profile
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

// ─────────────────────────────────────────
// GET ANY USER PROFILE BY ID (admin only)
// ─────────────────────────────────────────
const getUserById = async (userId) => {
  const result = await db.query(
    `SELECT id, email, username, full_name, role,
            language, mobile_no, avatar_url, created_at
     FROM users
     WHERE id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('User not found.', 404);
  }

  const user = result.rows[0];

  // Get role specific profile details
  if (user.role === 'student') {
    const studentResult = await db.query(
      `SELECT age, class_level, parent_mobile, school_name, board
       FROM student_profiles
       WHERE user_id = $1`,
      [userId]
    );
    user.student_profile = studentResult.rows[0] || null;
  }

  if (user.role === 'mentor') {
    const mentorResult = await db.query(
      `SELECT subject, qualification, experience, bio, is_verified
       FROM mentor_profiles
       WHERE user_id = $1`,
      [userId]
    );
    user.mentor_profile = mentorResult.rows[0] || null;
  }

  return user;
};
// ─────────────────────────────────────────
// GET ALL USERS (admin only)
// ─────────────────────────────────────────
const getAllUsers = async (role = null) => {
  const query = role
    ? `SELECT id, email, username, full_name, role,
              language, mobile_no, created_at, is_active
       FROM users
       WHERE role = $1
       ORDER BY created_at DESC`
    : `SELECT id, email, username, full_name, role,
              language, mobile_no, created_at, is_active
       FROM users
       ORDER BY created_at DESC`;

  const result = role
    ? await db.query(query, [role])
    : await db.query(query);

  return result.rows;
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  updateStudentProfile,
  updateMentorProfile,
  getUserById,
  getAllUsers,
};