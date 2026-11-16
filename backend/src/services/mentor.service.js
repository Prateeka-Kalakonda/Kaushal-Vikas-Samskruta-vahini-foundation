const db = require('../config/database');
const { AppError } = require('../utils/apiResponse');

// ─────────────────────────────────────────
// GET ALL MENTORS
// ─────────────────────────────────────────
const getAllMentors = async () => {
  const result = await db.query(
    `SELECT
       u.id, u.email, u.username, u.full_name,
       u.avatar_url, u.language,
       mp.subject, mp.qualification,
       mp.experience, mp.bio, mp.is_verified
     FROM users u
     LEFT JOIN mentor_profiles mp ON u.id = mp.user_id
     WHERE u.role = 'mentor'
       AND u.is_active = true
     ORDER BY mp.is_verified DESC, u.created_at DESC`
  );
  return result.rows;
};

// ─────────────────────────────────────────
// GET SINGLE MENTOR BY ID
// ─────────────────────────────────────────
const getMentorById = async (mentorId) => {
  const result = await db.query(
    `SELECT
       u.id, u.email, u.username, u.full_name,
       u.avatar_url, u.language, u.created_at,
       mp.subject, mp.qualification,
       mp.experience, mp.bio, mp.is_verified
     FROM users u
     LEFT JOIN mentor_profiles mp ON u.id = mp.user_id
     WHERE u.id = $1
       AND u.role = 'mentor'
       AND u.is_active = true`,
    [mentorId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Mentor not found.', 404);
  }

  return result.rows[0];
};

// ─────────────────────────────────────────
// GET MENTORS BY SUBJECT
// ─────────────────────────────────────────
const getMentorsBySubject = async (subject) => {
  const result = await db.query(
    `SELECT
       u.id, u.email, u.username, u.full_name,
       u.avatar_url,
       mp.subject, mp.qualification,
       mp.experience, mp.bio, mp.is_verified
     FROM users u
     JOIN mentor_profiles mp ON u.id = mp.user_id
     WHERE u.role = 'mentor'
       AND u.is_active = true
       AND LOWER(mp.subject) = LOWER($1)
     ORDER BY mp.experience DESC`,
    [subject]
  );

  return result.rows;
};

// ─────────────────────────────────────────
// CREATE MENTOR PROFILE
// ─────────────────────────────────────────
const createMentorProfile = async (userId, {
  subject,
  qualification,
  experience,
  bio,
}) => {
  const userResult = await db.query(
    'SELECT id, role FROM users WHERE id = $1',
    [userId]
  );

  if (userResult.rows.length === 0) {
    throw new AppError('User not found.', 404);
  }

  if (userResult.rows[0].role !== 'mentor') {
    throw new AppError('Only mentors can create a mentor profile.', 403);
  }

  const existing = await db.query(
    'SELECT id FROM mentor_profiles WHERE user_id = $1',
    [userId]
  );

  if (existing.rows.length > 0) {
    throw new AppError('Mentor profile already exists. Use update instead.', 409);
  }

  const result = await db.query(
    `INSERT INTO mentor_profiles
      (user_id, subject, qualification, experience, bio)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, subject, qualification, experience, bio, is_verified`,
    [userId, subject, qualification, experience, bio]
  );

  return result.rows[0];
};

// ─────────────────────────────────────────
// VERIFY MENTOR
// ─────────────────────────────────────────
const verifyMentor = async (mentorId) => {
  const mentorResult = await db.query(
    'SELECT id FROM mentor_profiles WHERE user_id = $1',
    [mentorId]
  );

  if (mentorResult.rows.length === 0) {
    throw new AppError('Mentor profile not found.', 404);
  }

  const result = await db.query(
    `UPDATE mentor_profiles
     SET is_verified = true,
         updated_at  = NOW()
     WHERE user_id = $1
     RETURNING id, is_verified`,
    [mentorId]
  );

  return result.rows[0];
};

// ─────────────────────────────────────────
// UNVERIFY MENTOR
// ─────────────────────────────────────────
const unverifyMentor = async (mentorId) => {
  const result = await db.query(
    `UPDATE mentor_profiles
     SET is_verified = false,
         updated_at  = NOW()
     WHERE user_id = $1
     RETURNING id, is_verified`,
    [mentorId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Mentor profile not found.', 404);
  }

  return result.rows[0];
};

// ─────────────────────────────────────────
// ASSIGN MENTOR ROLE TO USER
// ─────────────────────────────────────────
const assignMentorRole = async (userId) => {
  const userResult = await db.query(
    'SELECT id, role, full_name FROM users WHERE id = $1',
    [userId]
  );

  if (userResult.rows.length === 0) {
    throw new AppError('User not found.', 404);
  }

  if (userResult.rows[0].role === 'mentor') {
    throw new AppError('User is already a mentor.', 409);
  }

  if (userResult.rows[0].role === 'admin') {
    throw new AppError('Cannot change admin role to mentor.', 400);
  }

  const result = await db.query(
    `UPDATE users
     SET role = 'mentor',
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, email, full_name, role`,
    [userId]
  );

  return result.rows[0];
};

// ─────────────────────────────────────────
// GET MENTOR STATS (admin only)
// ─────────────────────────────────────────
const getMentorStats = async () => {
  const result = await db.query(
    `SELECT
       COUNT(*)                                    as total_mentors,
       COUNT(*) FILTER (WHERE mp.is_verified = true)  as verified_mentors,
       COUNT(*) FILTER (WHERE mp.is_verified = false) as unverified_mentors,
       COUNT(*) FILTER (WHERE mp.subject = 'Physics') as physics_mentors,
       COUNT(*) FILTER (WHERE mp.subject = 'Maths')   as maths_mentors,
       COUNT(*) FILTER (WHERE mp.subject = 'Chemistry') as chemistry_mentors
     FROM users u
     LEFT JOIN mentor_profiles mp ON u.id = mp.user_id
     WHERE u.role = 'mentor'`
  );

  return result.rows[0];
};

// ─────────────────────────────────────────
// GET MY STUDENTS (for logged in mentor)
// ─────────────────────────────────────────
const getMyStudents = async (mentorId) => {
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
// GET DETAILED PROGRESS OF ONE STUDENT
// (mentor viewing their assigned student)
// Logs this as mentor activity
// ─────────────────────────────────────────
const getStudentProgressForMentor = async (mentorId, studentId) => {

  const assignment = await db.query(
    `SELECT id FROM mentor_student_assignments
     WHERE mentor_id = $1 AND student_id = $2`,
    [mentorId, studentId]
  );

  if (assignment.rows.length === 0) {
    throw new AppError('This student is not assigned to you.', 403);
  }

  const studentResult = await db.query(
    `SELECT u.id, u.full_name, u.email,
            sp.age, sp.class_level, sp.school_name
     FROM users u
     LEFT JOIN student_profiles sp ON u.id = sp.user_id
     WHERE u.id = $1`,
    [studentId]
  );

  // Experiment-based progress (replaces chapter-based mastery)
  const totalExperimentsResult = await db.query(
    'SELECT COUNT(*) as total FROM experiments WHERE is_active = true'
  );
  const totalExperiments = parseInt(totalExperimentsResult.rows[0].total);

  const progressResult = await db.query(
    `SELECT
       ROUND(AVG(progress_pct)) as avg_progress,
       COUNT(*) FILTER (WHERE completed = true) as completed_count
     FROM student_experiment_progress
     WHERE user_id = $1`,
    [studentId]
  );

  const masteryPct = parseInt(progressResult.rows[0]?.avg_progress) || 0;
  const completedExperiments = parseInt(progressResult.rows[0]?.completed_count) || 0;

  // Recent experiment activity
  const recentActivity = await db.query(
    `SELECT e.title as experiment_title, sep.progress_pct, sep.last_updated_at
     FROM student_experiment_progress sep
     JOIN experiments e ON sep.experiment_id = e.id
     WHERE sep.user_id = $1
     ORDER BY sep.last_updated_at DESC
     LIMIT 5`,
    [studentId]
  );

  // Log this mentor activity (mentor viewed this student's progress)
  await db.query(
    `INSERT INTO mentor_activity_log (mentor_id, student_id, action_type)
     VALUES ($1, $2, 'view_progress')`,
    [mentorId, studentId]
  );

  return {
    student: studentResult.rows[0],
    mastery_percentage: masteryPct,
    experiments_completed: completedExperiments,
    total_experiments: totalExperiments,
    recent_activity: recentActivity.rows,
  };
};

// ─────────────────────────────────────────
// GET MENTOR PERFORMANCE OVERVIEW (admin only)
// Shows ALL mentors with performance metrics
// Based on student_experiment_progress
// ─────────────────────────────────────────
const getMentorPerformanceOverview = async () => {
  const result = await db.query(
    `SELECT
       u.id as mentor_id,
       u.full_name as mentor_name,
       u.email as mentor_email,
       mp.subject, mp.is_verified,
       COUNT(DISTINCT msa.student_id) as total_students,
       COUNT(DISTINCT mal.student_id) FILTER (
         WHERE mal.created_at >= NOW() - INTERVAL '7 days'
       ) as students_checked_this_week,
       COUNT(mal.id) FILTER (
         WHERE mal.created_at >= NOW() - INTERVAL '30 days'
       ) as total_activity_last_30_days,
       MAX(mal.created_at) as last_activity_at
     FROM users u
     LEFT JOIN mentor_profiles mp ON u.id = mp.user_id
     LEFT JOIN mentor_student_assignments msa ON u.id = msa.mentor_id
     LEFT JOIN mentor_activity_log mal ON u.id = mal.mentor_id
     WHERE u.role = 'mentor' AND u.is_active = true
     GROUP BY u.id, u.full_name, u.email, mp.subject, mp.is_verified
     ORDER BY total_students DESC`
  );

  const mentorsWithProgress = await Promise.all(
    result.rows.map(async (mentor) => {
      const avgProgressResult = await db.query(
        `SELECT
           ROUND(AVG(COALESCE(sep.progress_pct, 0))) as avg_mastery_pct
         FROM mentor_student_assignments msa
         LEFT JOIN student_experiment_progress sep ON sep.user_id = msa.student_id
         WHERE msa.mentor_id = $1`,
        [mentor.mentor_id]
      );

      return {
        ...mentor,
        avg_student_mastery_pct:
          parseInt(avgProgressResult.rows[0]?.avg_mastery_pct) || 0,
      };
    })
  );
// Sort by average student mastery, highest performance first
mentorsWithProgress.sort(
  (a, b) => b.avg_student_mastery_pct - a.avg_student_mastery_pct
);
  return mentorsWithProgress;
};

// ─────────────────────────────────────────
// GET ONE MENTOR'S DETAILED PERFORMANCE (admin only)
// Based on student_experiment_progress
// ─────────────────────────────────────────
const getMentorPerformanceDetail = async (mentorId) => {

  const mentorResult = await db.query(
    `SELECT u.id, u.full_name, u.email,
            mp.subject, mp.qualification, mp.experience, mp.is_verified
     FROM users u
     LEFT JOIN mentor_profiles mp ON u.id = mp.user_id
     WHERE u.id = $1 AND u.role = 'mentor'`,
    [mentorId]
  );

  if (mentorResult.rows.length === 0) {
    throw new AppError('Mentor not found.', 404);
  }

  const studentsResult = await db.query(
    `SELECT
       u.id, u.full_name, u.email,
       sp.class_level,
       COUNT(DISTINCT sep.experiment_id) as total_experiments_attempted,
       COUNT(DISTINCT sep.experiment_id) FILTER (WHERE sep.completed = true) as completed_experiments,
       ROUND(AVG(COALESCE(sep.progress_pct, 0))) as mastery_pct,
       MAX(sep.last_updated_at) as last_active_at,
       msa.assigned_at
     FROM mentor_student_assignments msa
     JOIN users u ON msa.student_id = u.id
     LEFT JOIN student_profiles sp ON u.id = sp.user_id
     LEFT JOIN student_experiment_progress sep ON sep.user_id = u.id
     WHERE msa.mentor_id = $1
     GROUP BY u.id, u.full_name, u.email, sp.class_level, msa.assigned_at
     ORDER BY mastery_pct DESC`,
    [mentorId]
  );

  const activityResult = await db.query(
    `SELECT mal.action_type, mal.created_at,
            u.full_name as student_name
     FROM mentor_activity_log mal
     JOIN users u ON mal.student_id = u.id
     WHERE mal.mentor_id = $1
     ORDER BY mal.created_at DESC
     LIMIT 10`,
    [mentorId]
  );

  return {
    mentor: mentorResult.rows[0],
    students: studentsResult.rows,
    recent_activity: activityResult.rows,
  };
};

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