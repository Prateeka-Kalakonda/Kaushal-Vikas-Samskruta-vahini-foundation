const express = require('express');
const router = express.Router();

const authRoutes             = require('./auth.routes');
const subjectRoutes          = require('./subject.routes');
const chapterRoutes          = require('./chapter.routes');
const contentRoutes          = require('./content.routes');
const bookmarkRoutes         = require('./bookmark.routes');
const noteRoutes             = require('./note.routes');
const progressRoutes         = require('./progress.routes');
const simulationRoutes       = require('./simulation.routes');
const translationRoutes      = require('./translation.routes');
const adminRoutes            = require('./admin.routes');
const adminUserRoutes        = require('./admin.user.routes');
const profileRoutes          = require('./profile.routes');
const mentorRoutes           = require('./mentor.routes');
const announcementRoutes     = require('./announcement.routes');
const experimentRoutes       = require('./experiment.routes');

router.use('/auth',          authRoutes);
router.use('/subjects',      subjectRoutes);
router.use('/topics',        chapterRoutes);
router.use('/chapters',      contentRoutes);
router.use('/bookmarks',     bookmarkRoutes);
router.use('/notes',         noteRoutes);
router.use('/progress',      progressRoutes);
router.use('/simulations',   simulationRoutes);
router.use('/translations',  translationRoutes);
router.use('/admin',         adminRoutes);
router.use('/admin/users',   adminUserRoutes);
router.use('/profile',       profileRoutes);
router.use('/mentors',       mentorRoutes);
router.use('/announcements', announcementRoutes);
router.use('/experiments',   experimentRoutes);

module.exports = router;